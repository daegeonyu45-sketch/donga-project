
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 타임아웃 헬퍼 - PromiseLike 호환성 및 안정성 확보
const withTimeout = (promise: PromiseLike<any>, ms: number) => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
  ]);
};

export async function POST(req: Request) {
  const reqId = Math.random().toString(36).substring(7);
  console.log(`[${reqId}] 기사 생성 요청 시작`);

  try {
    const { title, body: userBody, source, imageStyle } = await req.json();
    
    if (!title || !userBody) {
      return NextResponse.json({ error: "필수 입력 항목이 누락되었습니다." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const FALLBACK_IMG = 'https://images.unsplash.com/photo-1585829365234-781f8c4847c1?q=80&w=1200&auto=format&fit=crop';

    // 1. 텍스트 생성 (15초 타임아웃 적용 - 타임아웃 시 기본 텍스트 사용)
    console.log(`[${reqId}] Gemini 텍스트 생성 중...`);
    let aiResult;
    try {
      const textResponse = await withTimeout(ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `기사 제목: ${title}\n사용자 메모: ${userBody}\n출처: ${source}`,
        config: {
          systemInstruction: `당신은 대한민국 수석 기자입니다. 
          1. 본문(body): 사용자의 메모를 바탕으로 250자 이상의 풍성하고 전문적인 뉴스 리포트 작성 (~입니다 문체).
          2. 요약(summary): 기사를 대표하는 1~2문장의 핵심 요약 작성.
          3. 카테고리: [국내, 해외, 스포츠, 엔터, 경제, 인터랙티브] 중 가장 적합한 것 선택.
          반드시 JSON 형식으로 응답하십시오.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              body: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["body", "summary", "category"]
          }
        },
      }), 15000);

      aiResult = JSON.parse(textResponse.text || '{}');
    } catch (e) {
      console.error(`[${reqId}] 텍스트 생성 실패 또는 타임아웃:`, e);
      // AI 실패 시 사용자 입력 내용을 바탕으로 기본 객체 생성
      aiResult = {
        body: userBody + "\n\n(AI 분석 지연으로 인해 원문이 보존되었습니다. 잠시 후 다시 시도해 주세요.)",
        summary: title,
        category: "국내"
      };
    }

    // 2. DB 저장 (5초 타임아웃 적용)
    console.log(`[${reqId}] DB 저장 중...`);
    try {
      const { data: newArticle, error: dbError } = await withTimeout(supabase
        .from('articles')
        .insert({
          title: title,
          category: aiResult.category || '국내',
          summary: aiResult.summary || title,
          body: [aiResult.body || userBody],
          source: source || "알 수 없음",
          image_style: imageStyle || "실사 뉴스",
          thumbnail: FALLBACK_IMG,
          created_at: new Date().toISOString()
        })
        .select()
        .single(), 5000);

      if (dbError) throw dbError;
      console.log(`[${reqId}] 기사 생성 완료: ${newArticle.id}`);
      return NextResponse.json(newArticle);
    } catch (dbErr) {
      console.error(`[${reqId}] DB 저장 실패:`, dbErr);
      // DB 저장 실패 시에도 클라이언트가 멈추지 않도록 '임시 객체(Mock)' 반환
      // 이렇게 하면 화면에는 기사가 뜬 것처럼 보이나, 새로고침하면 사라짐 (사용자 경험 보호)
      const mockArticle = {
        id: `temp-${Date.now()}`,
        title,
        category: aiResult.category || '국내',
        summary: aiResult.summary || title,
        body: [aiResult.body || userBody],
        source: source || "알 수 없음",
        thumbnail: FALLBACK_IMG,
        image_style: imageStyle,
        created_at: new Date().toISOString(),
        isTemp: true // 임시 기사임을 표시
      };
      return NextResponse.json(mockArticle);
    }

  } catch (error: any) {
    console.error(`[${reqId}] 최종 API 에러:`, error);
    return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
  }
}
