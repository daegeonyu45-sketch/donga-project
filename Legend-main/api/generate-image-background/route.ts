
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { articleId, imagePrompt, imageStyle } = await req.json();

    // 1. Imagen 4.0 이미지 생성
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imgResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `${imagePrompt}, ${imageStyle} style, high quality news photography, 4k`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (!imgResponse.generatedImages || imgResponse.generatedImages.length === 0) {
      throw new Error("No image generated");
    }

    // 2. Storage 업로드
    const base64Data = imgResponse.generatedImages[0].image.imageBytes;
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `article-${articleId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    // 3. Public URL 획득
    const { data: urlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(fileName);

    // 4. DB 업데이트
    const { error: updateError } = await supabase
      .from('articles')
      .update({ thumbnail: urlData.publicUrl })
      .eq('id', articleId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error: any) {
    console.error("Background image generation failed:", error);
    // 백그라운드 작업이므로 에러가 나도 메인 응답에는 영향을 주지 않음
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
