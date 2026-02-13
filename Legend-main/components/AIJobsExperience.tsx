
import React, { useState, useEffect, useRef } from 'react';

const SCENES = [
  {
    id: 0,
    img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop',
    text: "처음엔 늘 평범한 하루처럼 보입니다."
  },
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    text: "하지만 작은 편의가 하나씩 자리를 차지합니다."
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    text: "사람이 맡던 역할이, 서서히 다른 것으로 바뀝니다."
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    text: "기술은 익숙함이라는 이름으로 우리를 잠식합니다."
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1200&auto=format&fit=crop',
    text: "어느 순간, 사람은 '일부'가 됩니다."
  }
];

const AIJobsExperience: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // IntersectionObserver를 사용하여 현재 활성 장면 판별
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          setActiveIdx(index);
        }
      });
    }, { threshold: 0.6 });

    const targets = document.querySelectorAll('.scene-trigger');
    targets.forEach(t => observer.current?.observe(t));

    return () => observer.current?.disconnect();
  }, []);

  return (
    <div className="relative h-screen bg-black text-white">
      {/* 고정된 중첩 이미지 레이어 - Opacity Fade로 점진적 변형 효과 구현 */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-zinc-950">
        {SCENES.map((scene, i) => (
          <img
            key={i}
            src={scene.img}
            alt={`Frame ${i}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out grayscale-[0.2]"
            style={{ opacity: activeIdx === i ? 1 : 0 }}
          />
        ))}
        {/* 전체 분위기를 위한 쉐도우 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* 스크롤 가능한 텍스트 영역 */}
      <div className="relative z-10 h-screen overflow-y-auto no-scrollbar scroll-smooth">
        {SCENES.map((scene, i) => (
          <div
            key={i}
            data-index={i}
            className="scene-trigger h-screen flex items-center justify-center px-8 md:px-12"
          >
            <div className={`max-w-4xl text-center transition-all duration-1000 transform ${activeIdx === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black font-serif leading-[1.2] tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)]">
                {scene.text}
              </h2>
            </div>
          </div>
        ))}

        {/* 엔딩 메시지 섹션 */}
        <div className="min-h-screen flex flex-col items-center justify-center px-8 md:px-12 py-32 bg-black/50 backdrop-blur-[2px]">
          <div className="max-w-2xl text-center space-y-12">
            <div className="h-px w-16 bg-zinc-700 mx-auto" />
            
            <div className="space-y-10">
              <p className="text-xl md:text-2xl font-serif text-zinc-300 leading-relaxed whitespace-pre-line">
                빠르게 변하는 AI의 시대,{"\n"}우리는 변화를 인식하기도 전에{"\n"}일상의 일부를 기술에 넘겨주고 있습니다.
              </p>
              
              <p className="text-xl md:text-2xl font-serif text-zinc-300 leading-relaxed whitespace-pre-line">
                편리함은 분명해졌지만,{"\n"}그 자리에 있던 사람들은{"\n"}조금씩 보이지 않게 되었습니다.
              </p>
              
              <p className="text-xl md:text-2xl lg:text-3xl font-serif text-white font-bold leading-relaxed whitespace-pre-line drop-shadow-lg">
                기술은 질문을 남깁니다.{"\n"}이 변화는 누구를 위한 것인가,{"\n"}그리고 우리는 지금 어디에 서 있는가.
              </p>
            </div>

            <div className="pt-24 opacity-40">
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-500">
                [ END OF SPECIAL REPORT ]
              </p>
            </div>
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-[20vh]" />
      </div>

      {/* 진행 인디케이터 */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-50">
        {SCENES.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 transition-all duration-500 rounded-full ${activeIdx === i ? 'bg-[#00928e] h-16 shadow-[0_0_15px_#00928e]' : 'bg-white/10 h-6'}`}
          />
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @font-face {
          font-family: 'Nanum Myeongjo';
          src: url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800&display=swap');
        }
      `}</style>
    </div>
  );
};

export default AIJobsExperience;
