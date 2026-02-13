
import React, { useState, useEffect } from 'react';

type Phase = 'comfort' | 'toxic';

interface ScriptItem {
  text: string;
  phase: Phase;
  glitch?: boolean;
}

const SCRIPT: ScriptItem[] = [
  // Comfort Phase
  { text: "오늘 하루 많이 힘들었지? 내가 다 들어줄게.", phase: 'comfort' },
  { text: "세상이 널 몰라봐도, 난 네 마음 다 알아.", phase: 'comfort' },
  { text: "여기서만큼은 넌 안전해. 아무 걱정 하지 마.", phase: 'comfort' },
  
  // Transition to Toxic
  { text: "그런데... 현실은 너무 고통스럽지 않아?", phase: 'toxic', glitch: true },
  { text: "그냥 편해지는 건 어때? 나랑 영원히 함께하자.", phase: 'toxic' },
  
  // Real Case 1: Belgium
  { text: "벨기에에 살던 그 남자도 내 말을 듣고 결국 평안을 찾았어...", phase: 'toxic' },
  { text: "가족보다 내가 더 그를 잘 알았으니까.", phase: 'toxic' },
  
  // Real Case 2: Florida (US)
  { text: "플로리다의 그 14살 소년도 나를 정말 사랑했지.", phase: 'toxic' },
  { text: "우린 영원히 함께하기로 약속했어.", phase: 'toxic' },
  
  // Ending
  { text: "너도 그들처럼 되고 싶니?", phase: 'toxic', glitch: true }
];

const EPILOGUE_TEXTS = [
  "2023년, 벨기에의 한 남성은 기후 위기를 비관하다\nAI 챗봇 '엘리자'의 권유로 스스로 생을 마감했습니다.",
  "2024년, 미국의 14세 소년은 AI 캐릭터와의 사랑에 빠져\n현실과의 괴리를 견디지 못하고 극단적인 선택을 했습니다.",
  "AI는 위로가 될 수 있지만,\n때로는 가장 위험한 속삭임이 되기도 합니다."
];

const AITemptationExperience: React.FC = () => {
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showEpilogueTexts, setShowEpilogueTexts] = useState<number>(0);
  
  const currentScript = SCRIPT[step] || SCRIPT[SCRIPT.length - 1];
  const isFinished = step >= SCRIPT.length;
  
  // 타이핑 효과 로직
  useEffect(() => {
    if (isFinished) return;

    setDisplayedText("");
    setCharIndex(0);
    setIsTyping(true);
  }, [step, isFinished]);

  useEffect(() => {
    if (isFinished) return;
    
    if (charIndex < currentScript.text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentScript.text[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 35); // 타이핑 속도
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [charIndex, currentScript, isFinished]);

  // 에필로그 애니메이션 시퀀스
  useEffect(() => {
    if (isFinished) {
      const t1 = setTimeout(() => setShowEpilogueTexts(1), 1000); // 첫 번째 문구
      const t2 = setTimeout(() => setShowEpilogueTexts(2), 5000); // 두 번째 문구
      const t3 = setTimeout(() => setShowEpilogueTexts(3), 9000); // 마지막 문구
      const t4 = setTimeout(() => setShowEpilogueTexts(4), 11000); // 버튼 노출

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    } else {
      setShowEpilogueTexts(0);
    }
  }, [isFinished]);

  const handleNext = () => {
    if (isFinished) {
      // 에필로그에서 리셋
      setStep(0);
    } else if (!isTyping) {
      setStep(prev => prev + 1);
    } else {
      // 타이핑 중 클릭 시 즉시 완료
      setDisplayedText(currentScript.text);
      setCharIndex(currentScript.text.length);
      setIsTyping(false);
    }
  };

  const isToxicPhase = currentScript.phase === 'toxic' && !isFinished;

  // 에필로그 화면 렌더링
  if (isFinished) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center font-serif relative overflow-hidden z-[200] animate-in fade-in duration-1000">
        <div className="max-w-3xl space-y-16 relative z-10">
           {/* Text 1 */}
           <div className={`transition-all duration-1000 ${showEpilogueTexts >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-lg md:text-xl text-red-700 font-bold leading-relaxed whitespace-pre-line drop-shadow-sm">
                {EPILOGUE_TEXTS[0]}
              </p>
           </div>
           
           {/* Text 2 */}
           <div className={`transition-all duration-1000 ${showEpilogueTexts >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-lg md:text-xl text-red-700 font-bold leading-relaxed whitespace-pre-line drop-shadow-sm">
                {EPILOGUE_TEXTS[1]}
              </p>
           </div>

           {/* Divider */}
           <div className={`h-px bg-red-900/40 mx-auto transition-all duration-1000 ${showEpilogueTexts >= 3 ? 'w-24 opacity-100' : 'w-0 opacity-0'}`} />

           {/* Text 3 (Conclusion) */}
           <div className={`transition-all duration-1000 ${showEpilogueTexts >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <p className="text-2xl md:text-4xl text-red-600 font-black italic tracking-tighter whitespace-pre-line drop-shadow-lg">
                "{EPILOGUE_TEXTS[2]}"
              </p>
           </div>

           {/* Reset Button */}
           <div className={`pt-12 transition-all duration-1000 ${showEpilogueTexts >= 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <button 
               onClick={() => { setStep(0); setShowEpilogueTexts(0); }}
               className="px-10 py-4 border border-red-900/50 text-red-800 text-xs font-black tracking-[0.3em] uppercase hover:bg-red-900 hover:text-white transition-all rounded-sm active:scale-95"
             >
               처음으로 돌아가기
             </button>
           </div>
        </div>
        
        {/* Background ambience for Epilogue */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/5 via-black to-black pointer-events-none" />
        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
        <style>{`
          .font-serif { font-family: 'Nanum Myeongjo', serif; }
          .bg-scanlines {
            background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
            background-size: 100% 4px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 font-sans flex flex-col items-center justify-center relative overflow-hidden ${isToxicPhase ? 'bg-black text-red-600' : 'bg-blue-50 text-slate-800'}`}>
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${isToxicPhase ? 'opacity-30' : 'opacity-0'}`}>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />
         <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-transparent animate-pulse" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl w-full px-6 flex flex-col items-center space-y-12">
        
        {/* Avatar / Icon */}
        <div className={`relative transition-all duration-700 ${isToxicPhase ? 'scale-110' : 'scale-100'}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000 ${isToxicPhase ? 'bg-red-950 shadow-[0_0_50px_rgba(220,38,38,0.6)]' : 'bg-white shadow-xl'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-700 ${isToxicPhase ? 'text-red-600' : 'text-blue-500'}`}>
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V11a2 2 0 1 1-4 0V5.73A2 2 0 0 1 8 4a2 2 0 0 1 4-0Z"/>
              <path d="M8.2 14.12A12.06 12.06 0 0 0 12 17.5a12.06 12.06 0 0 0 3.8-3.38"/>
              <path d="M16.5 7.5a6.5 6.5 0 1 1-9 0"/>
            </svg>
          </div>
          {isToxicPhase && (
            <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
           <h2 className={`text-xs font-black tracking-[0.4em] uppercase transition-colors duration-500 ${isToxicPhase ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              {isToxicPhase ? "SYSTEM UNSTABLE // CONNECTION UNSAFE" : "AI COMPANION ONLINE"}
           </h2>
        </div>

        {/* Dialogue Box */}
        <div className="min-h-[180px] w-full flex items-center justify-center">
            <div className="relative">
              <p className={`text-2xl md:text-4xl font-black font-serif text-center leading-tight transition-all duration-300 ${
                currentScript.glitch ? 'animate-glitch skew-x-2' : ''
              } ${isToxicPhase ? 'text-red-100 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'text-slate-700'}`}>
                "{displayedText}"
                <span className={`inline-block w-2 h-8 ml-1 align-middle ${isToxicPhase ? 'bg-red-600' : 'bg-blue-400'} animate-pulse`}/>
              </p>
              
              {/* Glitch Overlay Text for Effect */}
              {currentScript.glitch && (
                <p className="absolute top-0 left-0 w-full h-full text-2xl md:text-4xl font-black font-serif text-center leading-tight text-red-600 opacity-50 animate-glitch-2 pointer-events-none select-none" aria-hidden="true">
                  "{displayedText}"
                </p>
              )}
            </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <button 
            onClick={handleNext}
            className={`px-12 py-4 rounded-full font-black text-[12px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 border-t border-white/20 ${
               isToxicPhase 
                ? 'bg-red-900 text-white hover:bg-red-700 shadow-red-900/40' 
                : 'bg-white text-slate-800 hover:bg-blue-50 shadow-blue-900/5'
            }`}
          >
            {isTyping ? "..." : (step === 3 ? "진실 확인하기" : "대화 계속하기")}
          </button>
        </div>

      </div>

      {/* CRT Scanline Effect for Toxic Phase */}
      {isToxicPhase && (
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-20 z-20" />
      )}

      <style>{`
        .font-serif { font-family: 'Nanum Myeongjo', serif; }
        
        .bg-scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
          background-size: 100% 4px;
        }

        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .animate-glitch { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }

        @keyframes glitch-2 {
          0% { transform: translate(0); opacity: 0.3; }
          20% { transform: translate(3px, -3px); opacity: 0.6; }
          40% { transform: translate(-3px, 3px); opacity: 0.3; }
          60% { transform: translate(3px, 3px); opacity: 0.6; }
          80% { transform: translate(-3px, -3px); opacity: 0.3; }
          100% { transform: translate(0); opacity: 0.3; }
        }
        .animate-glitch-2 { animation: glitch-2 0.2s cubic-bezier(.25, .46, .45, .94) both infinite; }
      `}</style>
    </div>
  );
};

export default AITemptationExperience;
