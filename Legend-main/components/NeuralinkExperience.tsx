
import React, { useState, useEffect, useMemo } from 'react';

interface LanguageData {
  id: 'spanish' | 'chinese' | 'french';
  label: string;
  original: string;
  translated: string;
}

const LANGUAGES: LanguageData[] = [
  { 
    id: 'spanish', 
    label: 'Spanish Decode', 
    original: "Hola, ¿cómo estás? Neuralink te ayuda.", 
    translated: "안녕하세요, 잘 지내세요? 뉴럴링크가 돕습니다." 
  },
  { 
    id: 'chinese', 
    label: 'Chinese Decode', 
    original: "你好, 脑机接口 改变 세계.", 
    translated: "안녕하세요, 뇌-컴퓨터 인터페이스가 세상을 바꿉니다." 
  },
  { 
    id: 'french', 
    label: 'French Decode', 
    original: "Bonjour, c'est la revolution de Neuralink.", 
    translated: "안녕하세요, 이것은 뉴럴링크의 혁명입니다." 
  }
];

const NeuralNetworkBackground: React.FC = () => {
  const dots = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * -20,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15]">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {dots.map((dot, i) => (
          dots.slice(i + 1, i + 3).map((target, j) => (
            <line
              key={`${i}-${j}`}
              x1={dot.x} y1={dot.y}
              x2={target.x} y2={target.y}
              stroke="#007AFF"
              strokeWidth="0.1"
              className="animate-pulse"
              style={{ animationDuration: `${dot.duration}s` }}
            />
          ))
        ))}
        {dots.map((dot) => (
          <circle
            key={dot.id}
            cx={dot.x} cy={dot.y}
            r="0.3"
            fill="#007AFF"
            className="animate-pulse"
            style={{ animationDelay: `${dot.delay}s`, animationDuration: `${dot.duration / 2}s` }}
          />
        ))}
      </svg>
    </div>
  );
};

const GlitchText: React.FC<{ text: string; isDecoded: boolean }> = ({ text, isDecoded }) => {
  return (
    <div className="relative inline-block overflow-hidden">
      <span className={`block transition-all duration-300 ${isDecoded ? 'text-[#00F0FF] font-black' : 'text-zinc-500 font-serif opacity-70'}`}>
        {text}
      </span>
      {!isDecoded && (
        <div className="absolute inset-0 bg-white/5 animate-glitch-overlay pointer-events-none" />
      )}
    </div>
  );
};

const NeuralinkExperience: React.FC = () => {
  const [decoded, setDecoded] = useState<Record<string, boolean>>({
    spanish: false,
    chinese: false,
    french: false
  });
  const [decodingId, setDecodingId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleDecode = (id: 'spanish' | 'chinese' | 'french') => {
    if (decoded[id] || decodingId) return;
    
    setDecodingId(id);
    
    // Simulate digital noise / sync duration
    setTimeout(() => {
      setDecoded(prev => ({ ...prev, [id]: true }));
      setDecodingId(null);
    }, 1500);
  };

  useEffect(() => {
    const isAllDecoded = Object.values(decoded).every(val => val);
    if (isAllDecoded && !showReport) {
      const timer = setTimeout(() => {
        setShowReport(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [decoded, showReport]);

  const resetExperience = () => {
    setDecoded({ spanish: false, chinese: false, french: false });
    setShowReport(false);
    setDecodingId(null);
  };

  const analysisPoints = [
    {
      id: 1,
      title: "Paradigm Shift",
      text: "뉴럴링크는 지식을 수년에 걸쳐 '학습'하던 시대에서, 단 몇 초 만에 '동기화'하는 시대로의 패러다임 전환을 의미합니다."
    },
    {
      id: 2,
      title: "Real-time Connectivity",
      text: "이제 전 세계의 모든 정보와 지혜는 더 이상 외부의 기록이 아닌, 당신의 신경망과 직접 연결된 실시간 데이터가 됩니다."
    },
    {
      id: 3,
      title: "Redefining Communication",
      text: "신체적 제약을 넘어선 뇌와 컴퓨터의 결합은 인류가 소통하는 방식을 근본적으로 재정의하며, 진정한 의미의 초연결 사회를 완성할 것입니다."
    },
    {
      id: 4,
      title: "Digital Evolution",
      text: "우리는 이제 생물학적 한계를 넘어, 무한한 지적 확장이 가능한 '디지털 인류'의 첫 번째 단계를 딛고 서 있습니다."
    }
  ];

  return (
    <div className="relative w-full h-[85vh] overflow-hidden">
      {/* Cyberpunk Street Simulation Phase */}
      <div className={`absolute inset-0 bg-[#08080C] transition-opacity duration-[1500ms] ${showReport ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Neon City Background CSS Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-blue-900/10" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center grayscale" />
        
        {/* Hologram Scanlines Overlay */}
        <div className="absolute inset-0 bg-scanlines pointer-events-none z-10 opacity-30" />

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          
          {/* Central Area: Digital Billboards */}
          <div className="flex-1 w-full space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">Incoming Neural Stream</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {LANGUAGES.map(lang => (
                <div 
                  key={lang.id} 
                  className={`relative p-8 border border-white/5 backdrop-blur-md transition-all duration-700 overflow-hidden ${
                    decoded[lang.id] 
                      ? 'bg-[#00F0FF]/5 border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] scale-100' 
                      : 'bg-white/5 opacity-40 scale-95'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00F0FF]/40" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest">{lang.id} node sync</span>
                    {decodingId === lang.id && (
                      <span className="text-[9px] font-bold text-red-500 animate-pulse">DECODING...</span>
                    )}
                  </div>
                  <div className="text-xl md:text-3xl font-serif">
                    <GlitchText text={decoded[lang.id] ? lang.translated : lang.original} isDecoded={decoded[lang.id]} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Area: Hologram Control Panel */}
          <div className="w-full lg:w-80 space-y-8 animate-fade-in-right">
            <div className="p-8 bg-blue-900/10 border border-blue-500/20 backdrop-blur-xl rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 border-2 border-blue-500/30 rounded-full mx-auto flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-xs font-black text-white tracking-[0.3em] uppercase">Neural Interface</h3>
              </div>

              <div className="space-y-4">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => handleDecode(lang.id as any)}
                    disabled={decoded[lang.id] || !!decodingId}
                    className={`w-full group relative py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden border ${
                      decoded[lang.id]
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 cursor-default'
                        : decodingId === lang.id
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-blue-500/50 hover:text-white'
                    }`}
                  >
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                    <span className="relative z-10 flex items-center justify-between">
                      {lang.label}
                      {decoded[lang.id] ? (
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>
                      ) : (
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-12 space-y-4 border-t border-white/5 pt-8">
                <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600">
                  <span>OS_VERSION</span>
                  <span>4.2.0-NEURAL</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-zinc-600">
                  <span>SYNC_STATUS</span>
                  <span className={Object.values(decoded).filter(v => v).length === 3 ? 'text-blue-500' : 'text-red-500'}>
                    {Math.round((Object.values(decoded).filter(v => v).length / 3) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White Evolution Report Phase */}
      <div 
        className={`absolute inset-0 z-[400] bg-white transition-all duration-[1200ms] ease-in-out flex flex-col ${showReport ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <NeuralNetworkBackground />

        <div className="flex-1 overflow-y-auto pt-32 pb-20 px-6 relative z-10 flex flex-col items-center">
          <div className="max-w-4xl w-full mx-auto space-y-16">
            <div className="space-y-8 text-center">
              <div className="h-1.5 w-16 bg-[#007AFF] mx-auto" />
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-zinc-900 leading-tight tracking-tighter">
                “언어의 장벽이 무너진 순간,<br/>인류는 새로운 진화를 시작합니다.”
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-16 md:gap-y-12">
              {analysisPoints.map((point) => (
                <div key={point.id} className="space-y-4 p-8 border-l-2 border-[#007AFF]/10 hover:border-[#007AFF] transition-all bg-white/40 backdrop-blur-sm group">
                  <span className="text-[10px] font-black text-[#007AFF]/30 tracking-[0.3em] uppercase group-hover:text-[#007AFF] transition-colors">{point.title}</span>
                  <p className="text-base md:text-lg font-serif font-bold text-zinc-800 leading-relaxed">
                    {point.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-20 space-y-12 text-center">
              <button 
                onClick={resetExperience}
                className="group relative px-10 py-4 bg-zinc-900 text-white font-black text-[10px] tracking-[0.4em] uppercase rounded-sm shadow-xl hover:bg-[#007AFF] transition-all active:scale-95 flex items-center gap-3 mx-auto"
              >
                다시 체험하기
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
              
              <div className="pt-8 border-t border-zinc-50 flex flex-col items-center gap-2">
                 <p className="text-[9px] font-black text-zinc-300 tracking-[0.5em] uppercase">Donga-Ilbun Interactive Report // 2026</p>
                 <div className="flex gap-4 opacity-20">
                    <div className="w-1 h-1 rounded-full bg-zinc-400" />
                    <div className="w-1 h-1 rounded-full bg-zinc-400" />
                    <div className="w-1 h-1 rounded-full bg-zinc-400" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glitch-overlay {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-glitch-overlay { animation: glitch-overlay 2s infinite linear; }
        .bg-scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.1) 50%
          );
          background-size: 100% 4px;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fade-in-right 1s ease-out 0.3s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default NeuralinkExperience;
