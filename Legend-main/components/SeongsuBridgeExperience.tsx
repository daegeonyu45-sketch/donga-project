
import React, { useState, useEffect, useRef, useMemo } from 'react';

type Phase = 'countdown' | 'bridge' | 'article';

type Debris3D = {
  id: number;
  left: number;
  top: number;
  zStart: number;
  zEnd: number;
  delay: number;
  dur: number;
  size: { w: number; h: number; d: number };
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeed: { x: number; y: number; z: number };
  color: string;
  blur: number;
  kind: 'slab' | 'rebar' | 'fragment';
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const SENTENCES = [
  "“대부분은 상황을 인식하기도 전에,\n몸의 균형을 잃었습니다.”",
  "“경고 방송도,\n대피 안내도 없었습니다.”",
  "“다리가 무너지고 있다는 사실을\n깨닫는 데에도 시간이 필요했습니다.”",
  "“누군가는 브레이크를 밟았고,\n누군가는 핸들을 잡았습니다.”",
  "“하지만 선택이라고 부르기에는,\n너무 짧은 순간이었습니다.”",
  "“사고는 종종\n‘대처하지 못한 결과’로 설명됩니다.”",
  "“그러나 그날,\n대처할 수 있는 시간은\n주어지지 않았습니다.”",
  "“10초는,\n무언가를 하기에는\n너무 짧은 시간이었습니다.”"
];

const SeongsuBridgeExperience: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [countdown, setCountdown] = useState(10);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [activeSentence, setActiveSentence] = useState(-1);
  const [isBlackout, setIsBlackout] = useState(false);
  const animationGuard = useRef(false);

  // 1. Digital 3D Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'countdown') {
      setPhase('bridge');
    }
  }, [countdown, phase]);

  // 2. Article Scroll Tracking (IntersectionObserver for reliability)
  useEffect(() => {
    if (phase !== 'article') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-index'));
          setActiveSentence(idx);
        }
      });
    }, { 
      threshold: 0.5,
      rootMargin: "-20% 0px -20% 0px"
    });

    const elements = document.querySelectorAll('.scroll-sentence');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [phase]);

  // 3. Cinematic 3D Debris Generation
  const debrisList = useMemo<Debris3D[]>(() => {
    const count = 50;
    const concreteColors = ['#333333', '#4D4D4D', '#222222', '#555555'];
    const rebarColor = '#3E2723';

    return Array.from({ length: count }).map((_, i) => {
      const kindRand = Math.random();
      const kind = kindRand > 0.8 ? 'rebar' : kindRand > 0.4 ? 'slab' : 'fragment';
      
      const w = kind === 'rebar' ? rand(4, 10) : rand(60, 200);
      const h = kind === 'rebar' ? rand(200, 500) : rand(40, 150);
      const d = kind === 'rebar' ? rand(4, 10) : rand(20, 80);

      return {
        id: i,
        left: rand(-20, 120),
        top: rand(-500, -200),
        zStart: rand(500, -1500),
        zEnd: rand(0, 500),
        delay: rand(0, 1.5),
        dur: rand(1.2, 2.5),
        size: { w, h, d },
        rotX: rand(0, 360),
        rotY: rand(0, 360),
        rotZ: rand(0, 360),
        rotSpeed: { x: rand(180, 720), y: rand(180, 720), z: rand(180, 720) },
        color: kind === 'rebar' ? rebarColor : concreteColors[Math.floor(Math.random() * concreteColors.length)],
        blur: Math.random() > 0.6 ? rand(2, 6) : 0,
        kind
      };
    });
  }, []);

  const handleCollapseEnd = () => {
    if (!animationGuard.current) {
      animationGuard.current = true;
      setIsBlackout(true);
      setTimeout(() => {
        setPhase('article');
        setIsBlackout(false);
      }, 1200);
    }
  };

  return (
    <div className="bg-white min-h-screen relative overflow-x-hidden select-none font-sans">
      {/* Back Button */}
      <div className="fixed top-8 left-8 z-[1000]">
        <button 
          onClick={onBack} 
          className={`flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase transition-colors ${phase === 'article' ? 'text-zinc-400 hover:text-zinc-900' : 'text-white/50 hover:text-white'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
          BACK TO NEWSPAPER
        </button>
      </div>

      {/* Phase: 3D Digital Countdown */}
      {phase === 'countdown' && (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center overflow-hidden scene-3d">
          <div className="relative transform-3d">
            <div 
              key={countdown}
              className="text-[18rem] md:text-[28rem] font-black tabular-nums tracking-tighter text-white animate-digit-3d"
            >
              {countdown}
            </div>
            <p className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full text-center text-[10px] font-black tracking-[1em] text-white/10 uppercase">
              STRUCTURAL STABILITY: CRITICAL
            </p>
          </div>
        </div>
      )}

      {/* Phase: 3D Bridge Collapse Simulation */}
      {phase === 'bridge' && (
        <div 
          className={`fixed inset-0 z-[200] bg-[#050505] overflow-hidden scene-3d transition-opacity duration-[1200ms] ${isBlackout ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          <div className="transform-3d w-full h-full relative">
            {debrisList.map((d, i) => (
              <div
                key={d.id}
                className="absolute debris-3d-box"
                onAnimationEnd={i === 0 ? handleCollapseEnd : undefined}
                style={{
                  left: `${d.left}%`,
                  top: `${d.top}px`,
                  width: `${d.size.w}px`,
                  height: `${d.size.h}px`,
                  filter: `blur(${d.blur}px)`,
                  ['--dur' as any]: `${d.dur}s`,
                  ['--delay' as any]: `${d.delay}s`,
                  ['--zStart' as any]: `${d.zStart}px`,
                  ['--zEnd' as any]: `${d.zEnd}px`,
                  ['--rotX' as any]: `${d.rotX}deg`,
                  ['--rotY' as any]: `${d.rotY}deg`,
                  ['--rotZ' as any]: `${d.rotZ}deg`,
                  ['--rotSpeedX' as any]: `${d.rotSpeed.x}deg`,
                  ['--rotSpeedY' as any]: `${d.rotSpeed.y}deg`,
                  ['--rotSpeedZ' as any]: `${d.rotSpeed.z}deg`,
                  animation: `debris-fall-3d var(--dur) cubic-bezier(0.55, 0.055, 0.675, 0.19) var(--delay) forwards`
                } as React.CSSProperties}
              >
                <div className="cube-face front" style={{ backgroundColor: d.color, transform: `translateZ(${d.size.d / 2}px)` }} />
                <div className="cube-face back" style={{ backgroundColor: d.color, transform: `rotateY(180deg) translateZ(${d.size.d / 2}px)` }} />
                <div className="cube-face right" style={{ backgroundColor: d.color, width: `${d.size.d}px`, transform: `rotateY(90deg) translateZ(${d.size.w - d.size.d / 2}px)` }} />
                <div className="cube-face left" style={{ backgroundColor: d.color, width: `${d.size.d}px`, transform: `rotateY(-90deg) translateZ(${d.size.d / 2}px)` }} />
                <div className="cube-face top" style={{ backgroundColor: d.color, height: `${d.size.d}px`, transform: `rotateX(90deg) translateZ(${d.size.d / 2}px)` }} />
                <div className="cube-face bottom" style={{ backgroundColor: d.color, height: `${d.size.d}px`, transform: `rotateX(-90deg) translateZ(${d.size.h - d.size.d / 2}px)` }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-24 z-[100] text-center pointer-events-none px-6">
            <h2 className="text-white text-2xl md:text-5xl font-black tracking-[-0.05em] opacity-0 animate-impact-reveal italic font-serif">
              그날, 10초는 누구에게나 똑같이 흘렀습니다.
            </h2>
          </div>
        </div>
      )}

      {/* Phase: Article Content */}
      <div className={phase === 'article' ? 'opacity-100 relative z-10' : 'opacity-0 pointer-events-none fixed inset-0'}>
        {/* Title Section - Sticky Top */}
        <section className={`h-screen flex flex-col items-center justify-center px-6 text-center bg-white sticky top-0 transition-opacity duration-700 ${activeSentence >= 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-[#D32F2F] tracking-[0.6em] uppercase">October 21, 1994 / 07:40 AM</span>
              <h1 className="text-4xl md:text-7xl font-serif font-black text-zinc-900 tracking-tighter leading-none">
                1994년 10월 21일 07:40,<br/>멈춰버린 시간
              </h1>
            </div>
            <div className="pt-20">
              <div className="w-[1px] h-24 bg-gradient-to-b from-zinc-900 to-transparent mx-auto animate-scroll-indicator" />
              <p className="mt-6 text-[9px] font-black text-zinc-300 tracking-[0.5em] uppercase">Scroll to Witness</p>
            </div>
          </div>
        </section>

        {/* Scrolling Sentences Container - Overlays the title */}
        <div className="relative z-20">
          {SENTENCES.map((text, idx) => (
            <div key={idx} data-index={idx} className="scroll-sentence h-[80vh] flex flex-col items-center justify-center px-8 bg-white/90 backdrop-blur-sm snap-center border-t border-transparent">
              <div 
                className={`transition-all duration-1000 ease-out transform max-w-4xl text-center ${
                  activeSentence === idx 
                    ? 'opacity-100 translate-y-0 scale-100 blur-0' 
                    : 'opacity-0 translate-y-12 scale-95 blur-sm'
                }`}
              >
                <p className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight font-serif whitespace-pre-line drop-shadow-sm">
                  {text}
                </p>
              </div>
            </div>
          ))}
          
          <div className="h-[50vh] flex flex-col items-center justify-center text-center px-8 bg-white border-t border-zinc-100">
            <div className="max-w-xl space-y-10 py-20">
              <div className="h-px w-12 bg-zinc-300 mx-auto" />
              <p className="text-sm font-serif text-zinc-400 italic leading-relaxed uppercase tracking-widest opacity-60">
                [ END OF SPECIAL REPORT ]
              </p>
              <button 
                onClick={onBack}
                className="px-12 py-5 bg-zinc-900 text-white font-black text-[11px] tracking-[0.4em] uppercase rounded-full shadow-lg hover:bg-[#D32F2F] transition-all active:scale-95"
              >
                기사 목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scene-3d { perspective: 2000px; perspective-origin: 50% 50%; }
        .transform-3d { transform-style: preserve-3d; }
        .debris-3d-box { position: absolute; transform-style: preserve-3d; will-change: transform, opacity; }
        .cube-face { position: absolute; width: 100%; height: 100%; backface-visibility: visible; border: 1px solid rgba(255,255,255,0.02); }
        @keyframes debris-fall-3d {
          0% { transform: translateZ(var(--zStart)) translateY(0) rotateX(var(--rotX)) rotateY(var(--rotY)) rotateZ(var(--rotZ)); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateZ(var(--zEnd)) translateY(180vh) rotateX(calc(var(--rotX) + var(--rotSpeedX))) rotateY(calc(var(--rotY) + var(--rotSpeedY))) rotateZ(calc(var(--rotZ) + var(--rotSpeedZ))); opacity: 1; }
        }
        @keyframes digit-3d {
          0% { transform: scale(0.5) translateZ(-1000px) rotateY(-90deg); opacity: 0; filter: blur(20px); }
          20% { opacity: 1; filter: blur(0); }
          100% { transform: scale(1) translateZ(0) rotateY(0deg); opacity: 1; }
        }
        .animate-digit-3d { animation: digit-3d 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes impact-reveal {
          0% { opacity: 0; transform: translateY(30px); filter: blur(20px); }
          20% { opacity: 1; transform: translateY(0); filter: blur(0); }
          80% { opacity: 1; transform: translateY(0); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-20px); filter: blur(10px); }
        }
        .animate-impact-reveal { animation: impact-reveal 3.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        @keyframes scroll-indicator {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        .animate-scroll-indicator { animation: scroll-indicator 2.5s infinite cubic-bezier(0.77, 0, 0.175, 1); }
        .font-serif { font-family: 'Nanum Myeongjo', serif; }
      `}</style>
    </div>
  );
};

export default SeongsuBridgeExperience;
