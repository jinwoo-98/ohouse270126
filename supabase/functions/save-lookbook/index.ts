// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple slugification function
const slugify = (text) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

serve(async (req) => {
  const functionName = "save-lookbook";
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Lấy Authorization header một cách an toàn
    const authHeader = req.headers.get('Authorization');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();
    console.log(`[${functionName}] Received payload:`, body);

    const { lookPayload, lookItems } = body;

    if (!lookPayload || !lookPayload.title || !lookPayload.category_id) {
      return new Response(JSON.stringify({ error: "Missing required fields (title, category_id)." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Generate Slug on the server side
    const slugifiedTitle = slugify(lookPayload.title);
    const finalSlug = lookPayload.slug || slugifiedTitle;
    
    // 2. Prepare Lookbook Payload
    const finalLookPayload = {
      ...lookPayload,
      slug: finalSlug,
      updated_at: new Date().toISOString(),
    };
    
    // Ensure ID is null for new inserts if not provided
    if (!finalLookPayload.id) {
        delete finalLookPayload.id;
    }

    // 3. Upsert Lookbook
    const { data: lookData, error: lookError } = await supabaseClient
      .from('shop_looks')
      .upsert(finalLookPayload)
      .select()
      .single();

    if (lookError) {
      console.error(`[${functionName}] Lookbook Upsert Error:`, lookError);
      throw lookError;
    }
    
    const lookId = lookData.id;

    // 4. Sync Look Items
    // Delete old items
    const { error: deleteError } = await supabaseClient
      .from('shop_look_items')
      .delete()
      .eq('look_id', lookId);
      
    if (deleteError) {
      console.error(`[${functionName}] Delete Items Error:`, deleteError);
      throw deleteError;
    }

    // Insert new items
    if (lookItems && lookItems.length > 0) {
      const itemsToInsert = lookItems.map((item) => ({
        look_id: lookId,
        product_id: item.product_id,
        x_position: item.x_position,
        y_position: item.y_position,
        target_image_url: item.target_image_url,
      }));
      
      const { error: insertError } = await supabaseClient
        .from('shop_look_items')
        .insert(itemsToInsert);
        
      if (insertError) {
        console.error(`[${functionName}] Insert Items Error:`, insertError);
        throw insertError;
      }
    }

    return new Response(JSON.stringify({ success: true, lookId: lookId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${functionName}] General Error:`, error);
    return new Response(JSON.stringify({ error: (error && error.message) || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});