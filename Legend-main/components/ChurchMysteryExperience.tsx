
import React, { useState, useEffect, useRef } from 'react';

const LIGHT_SENTENCES = [
  "어느 마을에 누구보다 자애로운 한 목사가 있었습니다.",
  "그는 가난한 이들을 위해 헌신하며, 항상 인자한 미소로 이웃을 맞이했습니다.",
  "사람들은 그를 어둠 속의 길을 비추는 '살아있는 성자'라 칭송했습니다."
];

const DARK_SENTENCES = [
  "하지만 밤마다 그의 예배당에서는 끊이지 않는 기도 소리가 들려왔습니다.",
  "사실 그 소리는 기도가 아니라, 지하실에서 터져 나오는 비명 소리를 감추기 위한 소음이었습니다.",
  "성경책 뒤에 숨겨진 것은 구원이 아니라, 차마 기록할 수 없는 잔혹한 살인의 일기장이었습니다."
];

const ChurchMysteryExperience: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [displayedSentences, setDisplayedSentences] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTypingFinished, setIsTypingFinished] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const sentences = isDarkMode ? DARK_SENTENCES : LIGHT_SENTENCES;

  // Typing effect logic
  useEffect(() => {
    if (sentenceIndex >= sentences.length) {
      setIsTypingFinished(true);
      return;
    }

    setIsTypingFinished(false);
    if (charIndex < sentences[sentenceIndex].length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + sentences[sentenceIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedSentences(prev => [...prev, sentences[sentenceIndex]]);
        setCurrentText("");
        setSentenceIndex(prev => prev + 1);
        setCharIndex(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, sentenceIndex, sentences]);

  // Interaction Handler
  const handleMainAction = () => {
    if (!isDarkMode) {
      // Step 1: Light to Dark transition
      setIsDarkMode(true);
      setDisplayedSentences([]);
      setCurrentText("");
      setSentenceIndex(0);
      setCharIndex(0);
      setIsTypingFinished(false);
      setShowDetailedReport(false);
    } else if (isTypingFinished) {
      // Step 2: Show Detailed Report
      setShowDetailedReport(true);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] transition-colors duration-1000 flex flex-col items-center ${isDarkMode ? 'bg-[#000000]' : 'bg-[#FAFAFA]'} overflow-y-auto no-scrollbar`}>
      
      {/* Visual Canvas Area */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 shrink-0 relative">
        {/* Background Decorative Elements */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${isDarkMode ? 'opacity-40' : 'opacity-5'}`}>
           {isDarkMode && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-red-900/20 blur-[120px] rounded-full animate-pulse" />
           )}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] border transition-colors duration-1000 rounded-full ${isDarkMode ? 'border-red-950/30' : 'border-zinc-500'}`} />
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] border transition-colors duration-1000 rounded-full ${isDarkMode ? 'border-red-900/20' : 'border-zinc-400'}`} />
        </div>

        <div className="max-w-4xl w-full relative z-10 flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <p className={`text-[10px] font-black tracking-[0.5em] uppercase transition-colors duration-700 ${isDarkMode ? 'text-red-700' : 'text-zinc-400'}`}>
              {isDarkMode ? "The Unholy Truth" : "The Sacred Presence"}
            </p>
            <h2 className={`text-2xl md:text-4xl font-serif font-black transition-colors duration-700 leading-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              {isDarkMode ? "성경책 뒤의 기록" : "성자의 미소"}
            </h2>
          </div>

          {/* Central Cross Interaction */}
          <div className="relative group perspective-1000">
            <div className={`transition-all duration-[1500ms] ease-in-out transform ${isDarkMode ? 'rotate-180' : 'rotate-0'}`}>
               <svg 
                width="100" 
                height="150" 
                viewBox="0 0 100 150" 
                className={`transition-all duration-1000 ${isDarkMode ? 'text-[#FF0000] drop-shadow-[0_0_35px_rgba(255,0,0,0.8)]' : 'text-[#D4AF37] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]'}`}
                fill="currentColor"
              >
                <rect x="42" y="0" width="16" height="150" rx="4" />
                <rect x="0" y="42" width="100" height="16" rx="4" />
              </svg>
            </div>
            {isDarkMode && (
               <div className="absolute inset-0 bg-red-600/5 blur-[40px] rounded-full scale-150 animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Text Content Area */}
          <div className="min-h-[200px] flex flex-col items-center justify-center space-y-6 text-center max-w-2xl px-4">
            {displayedSentences.map((s, i) => (
              <p 
                key={i} 
                className={`text-lg md:text-xl font-serif font-bold leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700 ${isDarkMode ? 'text-red-600' : 'text-zinc-600'}`}
              >
                {s}
              </p>
            ))}
            {currentText && (
              <p className={`text-lg md:text-xl font-serif font-bold leading-relaxed border-r-2 animate-pulse pr-1 ${isDarkMode ? 'text-red-600 border-red-600' : 'text-zinc-600 border-zinc-300'}`}>
                {currentText}
              </p>
            )}
          </div>

          {/* Interaction Button */}
          <div className="flex justify-center pt-8">
            <button 
              onClick={handleMainAction}
              disabled={isDarkMode && !isTypingFinished && !showDetailedReport}
              className={`group relative px-12 py-5 font-black text-[11px] tracking-[0.4em] uppercase transition-all duration-700 rounded-full border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] active:scale-[0.98] disabled:opacity-30 border-t border-white/20 ${
                isDarkMode 
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {!isDarkMode ? "진실의 빛 비추기" : (isTypingFinished ? "자세히 보기" : "진실 확인 중...")}
              
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDarkMode ? 'bg-red-400' : 'bg-teal-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${isDarkMode ? 'bg-red-500' : 'bg-teal-500'}`}></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Report Section (Appears after Step 2) */}
      <div 
        ref={detailRef}
        className={`w-full max-w-4xl mx-auto p-8 md:p-20 transition-all duration-1000 transform ${showDetailedReport ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}
      >
        <div className={`border-t border-zinc-800 pt-12 space-y-12 font-serif ${isDarkMode ? 'text-zinc-300' : 'text-zinc-800'}`}>
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-red-700 tracking-tighter">참회록의 뒷면: 17년의 이중 생활</h3>
            <p className="text-sm font-sans font-black text-zinc-500 tracking-widest uppercase italic border-l-4 border-red-900 pl-4">Exclusive Investigative Report</p>
          </div>

          <div className="space-y-8 text-base md:text-lg leading-[1.8]">
            <p>
              그의 예배당 지하 2층에는 외부에 알려지지 않은 비밀 공간이 존재했습니다. 마을 사람들이 그를 '성자'라 칭하며 기부한 수억 원의 성금은 구제 사업이 아닌, 
              자신의 광기 어린 수집욕과 지하실의 방음 설비를 구축하는 데 사용되었습니다. 수사 당국은 해당 지하실에서 그가 십수 년간 기록해온 살인 일기 12권을 확보했습니다.
            </p>
            <p>
              일기장에는 그가 어떻게 사회적 약자들을 유인했는지, 그리고 성경 구절을 인용하며 고문을 정당화했는지에 대한 소름 끼치는 묘사들이 가득했습니다. 
              피해자들은 대부분 갈 곳 없는 부랑인이나 고아들이었으며, 그들의 실종은 목사의 높은 명망 뒤에 가려져 단 한 번도 정식 수사 대상이 되지 못했습니다.
            </p>
            <p>
              세상에 진실이 드러난 것은 한 탈출자의 필사적인 증언 덕분이었습니다. 당시 수사를 담당했던 형사는 "예배당의 은은한 찬송가 소리가 지하실의 비명을 가리는 완벽한 소음 차단막 역할을 했다"며 경악을 금치 못했습니다. 
              현재 목사는 무기징역을 선고받고 복역 중이지만, 아직도 그가 가르치던 마을 예배당의 차가운 벽면에는 지워지지 않는 공포의 흔적이 남아 있습니다.
            </p>
          </div>

          <div className="pt-20 border-t border-zinc-900/50 flex flex-col items-center gap-6">
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.6em] uppercase">Truth Remains Behind the Holy Mask</p>
            <button 
              onClick={() => setIsDarkMode(false)} 
              className="text-[10px] font-black text-zinc-500 hover:text-red-500 transition-colors tracking-widest uppercase underline underline-offset-8"
            >
              다시 처음으로 돌아가기
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @font-face {
          font-family: 'Nanum Myeongjo';
          src: url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800&display=swap');
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ChurchMysteryExperience;
