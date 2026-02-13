import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface Evidence {
  id: string;
  title: string;
  type: 'article' | 'law' | 'photo';
  content: string;
  unlocked: boolean;
  stage: number;
}

const INITIAL_EVIDENCES: Evidence[] = [
  { id: 'env-1', title: '평화시장 노동 실태', type: 'photo', content: '하루 15시간 노동, 환기창 없는 다락방 공장.', unlocked: false, stage: 1 },
  { id: 'law-1', title: '근로기준법 제49조', type: 'law', content: '성인 근로자의 노동 시간은 주 48시간을 초과할 수 없다.', unlocked: false, stage: 2 },
  { id: 'law-2', title: '근로기준법 제45조', type: 'law', content: '유해하고 위험한 작업에 대한 안전 장치 의무.', unlocked: false, stage: 2 },
  { id: 'neglect-1', title: '업주의 법 무시', type: 'article', content: '근로감독관의 시정 지시에도 불구하고 변하지 않는 환경.', unlocked: false, stage: 3 },
  { id: 'state-1', title: '보건사회부의 인지', type: 'article', content: '정부는 이미 평화시장의 실태를 진정서를 통해 알고 있었다.', unlocked: false, stage: 4 },
];

const JeonTaeilExperience: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [evidences, setEvidences] = useState<Evidence[]>(INITIAL_EVIDENCES);
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkEvidenceUnlocks = (text: string) => {
    let unlockedAny = false;
    const newEvidences = evidences.map(ev => {
      if (!ev.unlocked) {
        const keywords: Record<string, string[]> = {
          'env-1': ['노동 시간', '15시간', '다락방', '평화시장'],
          'law-1': ['근로기준법', '48시간', '49조'],
          'law-2': ['안전', '유해', '45조'],
          'neglect-1': ['업주', '방치', '무시', '시정'],
          'state-1': ['진정서', '보건사회부', '정부', '인지']
        };

        if (keywords[ev.id].some(kw => text.includes(kw))) {
          unlockedAny = true;
          return { ...ev, unlocked: true };
        }
      }
      return ev;
    });

    if (unlockedAny) {
      setEvidences(newEvidences);
      const unlockedEvs = newEvidences.filter(e => e.unlocked);
      const maxUnlockedStage = unlockedEvs.length > 0 ? Math.max(...unlockedEvs.map(e => e.stage)) : 0;
      if (maxUnlockedStage >= currentStage && currentStage < 4) {
        setCurrentStage(maxUnlockedStage + 1);
      }
      
      if (newEvidences.every(e => e.unlocked)) {
        setIsFinished(true);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isFinished) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: `당신은 1970년 당시의 '근로기준법' 기록 보관소이자 조사관입니다. 
          비극적 사건에 대해 감정적인 표현(슬프다, 참혹하다 등)을 절대 사용하지 마십시오. 
          오직 당시의 기록, 신문 기사(동아일보, 경향신문), 법 조문만을 근거로 답변하십시오. 
          추측하거나 상상하지 마십시오. 
          반드시 출처를 명시하십시오(예: 동아일보 1970-11-14). 
          기록이 없는 사실에 대해서는 "해당 질문에 대한 공식 기록은 확인되지 않는다"라고 답변하십시오.
          답변은 한국어로 작성하십시오.`
        }
      });

      const aiText = response.text || "기록을 조회할 수 없습니다.";
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: aiText,
        sources: aiText.match(/\[(.*?)\]|\((.*?)\)|(동아일보|경향신문|근로기준법)\s?\d+/g) || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      checkEvidenceUnlocks(aiText + " " + input);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "조사 시스템 오류가 발생했습니다. 다시 시도하십시오." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 font-sans text-zinc-900 border-x border-zinc-200 shadow-inner">
      <div className="p-4 bg-white border-b border-zinc-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Evidence Locker [ {evidences.filter(e => e.unlocked).length} / {evidences.length} ]</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400">STAGE {currentStage} / 4</span>
            <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-800 transition-all" style={{ width: `${(currentStage / 4) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {evidences.map(ev => (
            <div 
              key={ev.id} 
              className={`flex-shrink-0 w-32 h-20 p-2 border rounded-sm transition-all flex flex-col justify-between ${ev.unlocked ? 'bg-zinc-50 border-zinc-800 opacity-100' : 'bg-zinc-100 border-zinc-200 opacity-30'}`}
            >
              <span className={`text-[8px] font-black uppercase tracking-tighter ${ev.unlocked ? 'text-zinc-800' : 'text-zinc-300'}`}>{ev.type}</span>
              <p className="text-[10px] font-bold leading-tight truncate">{ev.unlocked ? ev.title : '???'}</p>
              {ev.unlocked && <span className="text-[8px] text-zinc-400">SECURED</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col relative bg-zinc-50">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="space-y-8 py-10">
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-serif font-black">기록 조사 가이드</h4>
                  <p className="text-xs text-zinc-400">조사 대상: 1970년 11월 13일 전태일 사건</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "당시 평화시장 여공들의 하루 노동 시간은?",
                    "근로기준법은 존재했는가?",
                    "법은 왜 적용되지 않았는가?",
                    "국가는 무엇을 알고 있었는가?"
                  ].map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => setInput(q)}
                      className="text-left p-3 text-xs bg-white border border-zinc-200 hover:border-zinc-800 transition-colors rounded-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-sm ${m.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-white border border-zinc-200 text-zinc-800'}`}>
                  <p className="text-sm font-serif leading-relaxed whitespace-pre-line">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-zinc-100 flex flex-wrap gap-2">
                      {m.sources.map((s, si) => (
                        <span key={si} className="text-[9px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-sm">REF: {s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200 p-4 rounded-sm">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            {isFinished && (
              <div className="py-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="inline-block px-8 py-6 bg-zinc-900 text-white space-y-4">
                  <p className="text-sm font-serif italic">“이상으로 기록 조회를 종료합니다.”</p>
                  <p className="text-sm font-serif italic">“이후의 판단은 기록이 아닌, 당신의 몫입니다.”</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-zinc-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isFinished}
                placeholder={isFinished ? "조사가 종료되었습니다." : "조사할 내용을 입력하십시오..."}
                className="flex-1 px-4 py-3 text-sm border border-zinc-200 outline-none focus:border-zinc-800 transition-colors rounded-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || isFinished}
                className="px-6 py-3 bg-zinc-900 text-white text-xs font-black tracking-widest uppercase disabled:opacity-20 transition-all rounded-sm"
              >
                Query
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-64 bg-zinc-100 p-4 border-l border-zinc-200 overflow-y-auto">
          <h4 className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase mb-6">Source Log</h4>
          <div className="space-y-4">
            {messages.filter(m => m.role === 'assistant').map((m, i) => (
              m.sources?.map((s, si) => (
                <div key={`${i}-${si}`} className="p-3 bg-white border border-zinc-200 rounded-sm animate-in slide-in-from-right-4">
                  <p className="text-[10px] font-bold text-zinc-800 leading-tight mb-1">{s}</p>
                  <p className="text-[8px] text-zinc-400">VERIFIED FROM ARCHIVE</p>
                </div>
              ))
            ))}
            {messages.length === 0 && (
              <p className="text-[10px] text-zinc-300 italic">No sources cited yet.</p>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; } 
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default JeonTaeilExperience;