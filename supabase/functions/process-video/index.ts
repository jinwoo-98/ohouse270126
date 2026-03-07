// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, uploadId } = await req.json()
    
    const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID')
    const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET')

    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      console.error("[process-video] Missing Mux API Keys in environment");
      throw new Error("Chưa cấu hình Mux API Keys trong Supabase Secrets.")
    }

    const auth = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)

    if (action === 'create-upload') {
      console.log("[process-video] Creating direct upload URL...");
      
      const response = await fetch('https://api.mux.com/video/v1/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          new_asset_settings: {
            playback_policy: ['public'],
          },
          cors_origin: '*',
        }),
      })

      const data = await response.json()
      console.log("[process-video] Upload URL created successfully");
      return new Response(JSON.stringify(data.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'check-status') {
      console.log(`[process-video] Checking status for upload: ${uploadId}`);
      
      const response = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })

      const data = await response.json()
      const assetId = data.data.asset_id

      if (assetId) {
        const assetResponse = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
          headers: { 'Authorization': `Basic ${auth}` }
        })
        const assetData = await assetResponse.json()
        const playbackId = assetData.data.playback_ids?.[0]?.id
        
        console.log(`[process-video] Asset processed. Playback ID: ${playbackId}`);
        return new Response(JSON.stringify({ 
          status: data.data.status, 
          playbackId,
          url: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ status: data.data.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error("Hành động không hợp lệ.")

  } catch (error) {
    console.error("[process-video] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})