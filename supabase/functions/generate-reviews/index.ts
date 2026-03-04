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
    const { productId, productName, count, rating } = await req.json()
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Lấy API Key
    const { data: secret } = await supabaseAdmin
      .from('app_secrets')
      .select('value')
      .eq('key', 'GEMINI_API_KEY')
      .single()

    if (!secret?.value) {
      throw new Error("Gemini API Key chưa được cấu hình trong Cài đặt.")
    }

    // 2. Gọi Gemini API
    const prompt = `
      Bạn là một khách hàng đã mua sản phẩm nội thất "${productName}". 
      Hãy viết ${count} bài đánh giá chân thực bằng tiếng Việt.
      Yêu cầu:
      - Giọng văn tự nhiên, có thể dùng từ ngữ đời thường (VD: "ưng cái bụng", "shop nhiệt tình", "hơi chậm tí nhưng ok").
      - Điểm sao trung bình khoảng ${rating}/5. Hãy tạo sự đa dạng (có bài 5 sao, có bài 4 sao).
      - Nội dung tập trung vào: chất lượng gỗ/vải, độ hoàn thiện, cảm giác khi sử dụng, đóng gói vận chuyển.
      - Tên người dùng là tên tiếng Việt ngẫu nhiên.
      - Trả về kết quả dưới dạng mảng JSON duy nhất, không có văn bản thừa.
      - Cấu trúc: [{"user_name": "Tên", "rating": 5, "comment": "Nội dung"}]
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${secret.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const aiData = await response.json()
    const aiText = aiData.candidates[0].content.parts[0].text
    
    // Làm sạch chuỗi JSON nếu AI trả về markdown block
    const cleanJson = aiText.replace(/```json|```/g, '').trim()
    const reviews = JSON.parse(cleanJson)

    // 3. Lưu vào database
    const reviewsToInsert = reviews.map((r: any) => ({
      product_id: productId,
      user_name: r.user_name,
      rating: r.rating,
      comment: r.comment,
      created_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabaseAdmin.from('reviews').insert(reviewsToInsert)
    if (insertError) throw insertError

    console.log(`[generate-reviews] Generated ${reviewsToInsert.length} reviews for ${productName}`)

    return new Response(JSON.stringify({ success: true, count: reviewsToInsert.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[generate-reviews] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})