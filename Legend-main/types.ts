export interface Article {
  id: string;
  title: string;
  thumbnail: string;
  summary: string;
  lead: string;
  body: string[];
  imagePrompt?: string;
  category: string;
  caption?: string;
  isInteractive?: boolean;
}

// 온도를 기준으로 한 단계 정의
export type TimeStep = 0 | 1 | 1.5 | 2 | 3 | 4;

export interface StepData {
  temp: string;
  description: string;
  impactLevel: number; // 0 (안전) ~ 5 (위험)
  fallbackAnalysis: string; // API 실패 시 제공할 기본 분석 문구
}