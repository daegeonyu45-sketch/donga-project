
import { GoogleGenAI } from "@google/genai";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getCacheKey = (type: string, identifier: string) => `climate_cache_${type}_${identifier}`;

// 글로벌 쿼터 상태 관리 (메모리 내)
let quotaExhaustedUntil = 0;

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  // 이미 쿼터가 소진된 상태라면 즉시 중단
  if (Date.now() < quotaExhaustedUntil) {
    throw new Error("QUOTA_EXHAUSTED_LOCKOUT");
  }

  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isQuotaError = 
      error?.status === 429 || 
      error?.code === 429 || 
      errorMsg.includes("quota") || 
      errorMsg.includes("429") ||
      errorMsg.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaError) {
      // 429 발생 시 60초간 락아웃 설정
      quotaExhaustedUntil = Date.now() + 60000;
      console.warn("Gemini API Quota Exceeded. Entering fallback mode for 60s.");
      throw new Error("QUOTA_EXHAUSTED");
    }

    if (retries > 0) {
      await wait(delay);
      return fetchWithRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

export async function getClimateAnalysis(
  stepDescription: string, 
  temp: string, 
  stepId: number, 
  fallback?: string
): Promise<string> {
  const cacheKey = getCacheKey('analysis', stepId.toString());
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const result = await fetchWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `당신은 기후 전문 기자입니다. 다음 상황에 대한 짧고 강렬한(한 문장) 분석을 해주세요.
        상황: ${stepDescription}
        온도: ${temp}
        톤: 진지하고 성찰적인 저널리즘 스타일`,
      });
      const text = response.text || "";
      if (!text) throw new Error("Empty response");
      return text;
    });

    localStorage.setItem(cacheKey, result);
    return result;
  } catch (error: any) {
    // 쿼터 에러 등 실패 시 조용히 폴백 반환 (콘솔 에러 최소화)
    return fallback || cached || "지속 가능한 미래를 위한 데이터 분석이 진행 중입니다.";
  }
}
