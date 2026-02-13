
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";

// 서버 사이드용 Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { prompt, style } = await req.json();
    
    // 1. Gemini Imagen 4.0 모델을 사용하여 이미지 생성
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `${prompt}, ${style} style, high quality journalistic photography, award winning news photo, 4k resolution`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("이미지 생성 결과가 없습니다.");
    }

    // 2. 생성된 이미지(base64)를 Buffer로 변환
    const base64Data = response.generatedImages[0].image.imageBytes;
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 3. Supabase Storage에 업로드
    const fileName = `ai-gen-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { data, error } = await supabase.storage
      .from('news-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // 4. Public URL 생성
    const { data: urlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    console.error("Image generation API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
