// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, orderId, contact, productId } = await req.json();

    // --- BẢO MẬT: Kiểm duyệt đầu vào contact ---
    const cleanContact = typeof contact === 'string' ? contact.trim() : '';
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const isPhone = /^[0-9+]{8,15}$/.test(cleanContact);

    if (!isEmail && !isPhone) {
      return new Response(JSON.stringify({ error: "Vui lòng nhập Email hoặc Số điện thoại hợp lệ." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- BẢO MẬT: Kiểm tra định dạng UUID của orderId ---
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanOrderId = typeof orderId === 'string' ? orderId.trim().replace('#', '') : '';
    
    if (!uuidRegex.test(cleanOrderId)) {
      return new Response(JSON.stringify({ error: "Mã đơn hàng không hợp lệ. Vui lòng nhập đầy đủ mã đơn hàng (UUID)." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'track') {
      // Sử dụng .eq() thay vì .ilike() để tránh brute-force tiền tố
      const { data: orders, error } = await supabase
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
        .eq('id', cleanOrderId)
        .or(`contact_phone.eq.${cleanContact},contact_email.eq.${cleanContact}`);

      if (error) throw error;

      if (!orders || orders.length === 0) {
        return new Response(JSON.stringify({ error: "Không tìm thấy đơn hàng phù hợp." }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify-purchase') {
      if (!productId) {
        return new Response(JSON.stringify({ error: "Thiếu thông tin sản phẩm." }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, order_items!inner(product_id)')
        .eq('id', cleanOrderId)
        .eq('status', 'delivered')
        .eq('order_items.product_id', productId)
        .or(`contact_phone.eq.${cleanContact},contact_email.eq.${cleanContact}`);

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
    return new Response(JSON.stringify({ error: "Lỗi hệ thống nội bộ." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})