// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, orderId, contact, productId } = await req.json();

    if (action === 'track') {
      if (!orderId || !contact) {
        return new Response(JSON.stringify({ error: "Thiếu mã đơn hàng hoặc thông tin liên hệ." }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Search for the order. We support both full UUID and the 8-char prefix used in the UI.
      // We enforce that the contact (phone or email) MUST match.
      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          order_items (
            product_name,
            quantity,
            price,
            product_image
          )
        `)
        .or(`contact_phone.eq.${contact},contact_email.eq.${contact}`);

      // If it's a full UUID
      if (orderId.length === 36) {
        query = query.eq('id', orderId);
      } else {
        // If it's the 8-char prefix
        query = query.ilike('id', `${orderId}%`);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      if (!orders || orders.length === 0) {
        return new Response(JSON.stringify({ error: "Không tìm thấy đơn hàng phù hợp." }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Return sanitized data (no full address, no full contact info)
      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify-purchase') {
      if (!productId || !contact || !orderId) {
        return new Response(JSON.stringify({ error: "Thiếu thông tin xác thực." }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if there's a delivered order for this product with matching contact and orderId
      let query = supabase
        .from('orders')
        .select('id, order_items!inner(product_id)')
        .eq('status', 'delivered')
        .eq('order_items.product_id', productId)
        .or(`contact_phone.eq.${contact},contact_email.eq.${contact}`);

      if (orderId.length === 36) {
        query = query.eq('id', orderId);
      } else {
        query = query.ilike('id', `${orderId}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ hasPurchased: data && data.length > 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: "Hành động không hợp lệ." }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[order-lookup] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})