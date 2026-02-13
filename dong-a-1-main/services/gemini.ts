
import { GoogleGenAI, Type, Modality } from "@google/genai";

const extractJson = (text: string) => {
  try {
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = cleanText.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = cleanText.lastIndexOf(']');
    }
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      return cleanText.substring(startIdx, endIdx + 1);
    }
    return cleanText;
  } catch (e) {
    return text;
  }
};

const handleAIError = (error: any) => {
  console.error("Gemini API Error Details:", error);
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
  
  if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota')) {
    throw new Error("QUOTA_EXCEEDED");
  }
  if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) throw new Error("PERMISSION_DENIED");
  if (errorStr.includes('500') || errorStr.includes('INTERNAL')) throw new Error("INTERNAL_SERVER_ERROR");
  throw error;
};

const callWithRetry = async (fn: () => Promise<any>, maxRetries = 2): Promise<any> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = JSON.stringify(error);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) throw error;
      if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) throw error;
      if (errorStr.includes('500') || errorStr.includes('INTERNAL')) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

const createAI = () => {
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateCoverageSuggestions = async (isMock: boolean = false) => {
  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { id: "1", title: "K-배터리 전고체 전지 로드맵", category: "Tech", angle: "글로벌 점유율 전략", urgency: "High" },
      { id: "2", title: "손흥민 프리미어리그 득점왕 재도전", category: "Sports", angle: "체력 안배와 전술 변화", urgency: "Medium" },
      { id: "3", title: "넷플릭스 오리지널 'K-콘텐츠' 투자 확대", category: "Entertainment", angle: "글로벌 시장 영향력", urgency: "High" },
      { id: "4", title: "초거대 AI 언어모델의 윤리 기준", category: "Tech", angle: "글로벌 거버넌스", urgency: "High" }
    ];
  }
  return callWithRetry(async () => {
    try {
      const ai = createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `당신은 동아일보의 AI 편집국장입니다. 현재 글로벌 트렌드(정치, 경제, 사회, IT/과학, 연예, 스포츠 등)를 분석하여 실시간으로 취재할 가치가 높은 4가지 아이템을 추천하세요.`,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                angle: { type: Type.STRING },
                urgency: { type: Type.STRING }
              },
              required: ["id", "title", "category", "angle", "urgency"]
            }
          }
        }
      });
      return JSON.parse(extractJson(response.text));
    } catch (error) {
      return handleAIError(error);
    }
  });
};

export const generateFactBasedArticle = async (topic: string, category: string, isMock: boolean = false) => {
  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      title: `[AI 팩트체크] ${topic}의 실상과 전망`,
      category,
      summary: "이 기사는 AI 분석을 통해 작성된 핵심 요약입니다.",
      content: "<p>현재 주요 지표들은 급격한 변화를 예고하고 있습니다.</p><p>교차 검증 결과 사실로 확인되었습니다.</p>",
      factCheck: "상위 3개 채널 교차 검증 완료",
      sources: ["공식 통계"],
      imageKeyword: topic
    };
  }
  return callWithRetry(async () => {
    try {
      const ai = createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: `주제: "${topic}" (카테고리: ${category})
        당신은 동아일보의 데이터 저널리즘 팀장입니다. 사실을 수집하고 리포트를 작성하세요.
        
        [중요 지시 사항]
        1. ###, **, *** 와 같은 마크다운 기호는 절대 사용하지 마십시오.
        2. 기사 본문은 가독성을 위해 반드시 <p style="margin-bottom: 20px;"> 태그를 사용하여 문단을 나누십시오.
        3. 소제목이 필요한 경우 <h3 style="font-weight: bold; margin-top: 30px; margin-bottom: 10px; color: white; font-size: 1.5rem;">제목</h3> 형식을 사용하십시오.
        4. 문장 끝에는 항상 적절한 마침표를 찍으십시오.
        5. 카테고리가 '연예'나 '스포츠'인 경우 전문적이고 흥미로운 톤으로 작성하십시오.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              factCheck: { type: Type.STRING },
              sources: { type: Type.ARRAY, items: { type: Type.STRING } },
              imageKeyword: { type: Type.STRING }
            },
            required: ["title", "category", "summary", "content", "factCheck", "sources", "imageKeyword"]
          }
        }
      });
      const parsed = JSON.parse(extractJson(response.text));
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchSources = groundingChunks.filter((chunk: any) => chunk.web).map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title
      })).slice(0, 3);
      return { ...parsed, searchSources };
    } catch (error) {
      return handleAIError(error);
    }
  });
};

export const generateImage = async (prompt: string, isMock: boolean = false) => {
  if (isMock) return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80`;
  return callWithRetry(async () => {
    try {
      const ai = createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Professional photo for news article: ${prompt}. Photorealistic, 16:9 aspect ratio.` }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80`;
    } catch (error) {
      return handleAIError(error);
    }
  });
};

export const generateComments = async (content: string, isMock: boolean = false) => {
  if (isMock) return [{ user: "독자", comment: "샘플 댓글입니다.", likes: 10 }];
  return callWithRetry(async () => {
    try {
      const ai = createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `다음 기사에 대한 예상 댓글 5개를 JSON 배열로 생성하세요: ${content}`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                user: { type: Type.STRING },
                comment: { type: Type.STRING },
                likes: { type: Type.NUMBER }
              }
            }
          }
        }
      });
      return JSON.parse(extractJson(response.text));
    } catch (error) {
      return handleAIError(error);
    }
  });
};

export const generateTrotLyrics = async (newsText: string, isMock: boolean = false) => {
  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[에헤라디야] 오늘의 뉴스 한마당~\n\n${newsText}\n\n얼쑤! 우리 기사가 제일이로구나!`;
  }
  return callWithRetry(async () => {
    try {
      const ai = createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `당신은 한국의 판소리 명창입니다. 다음 뉴스 내용을 바탕으로 신명나는 판소리 사설(가사)을 작성하세요. 추임새(얼쑤, 좋다 등)를 포함하여 풍자적이면서도 흥겹게 작성해 주세요.\n\n뉴스 내용: ${newsText}`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      return handleAIError(error);
    }
  });
};

export const speakTrot = async (lyrics: string, isMock: boolean = false) => {
  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return null;
  }
  return callWithRetry(async () => {
    try {
      const ai = createAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `소리꾼의 목소리로 힘차게 읽어다오: ${lyrics}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      return handleAIError(error);
    }
  });
};

export const decodeAudio = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const data = bytes;
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
