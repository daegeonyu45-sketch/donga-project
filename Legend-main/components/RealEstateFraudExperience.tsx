
import React, { useState, useEffect, useCallback } from 'react';

const FOMO_MESSAGES = [
  "“지금 바로 옆 팀에서 3채 가계약 들어갔어요!”",
  "“이 위치는 프리미엄 무조건 2억 붙습니다.”",
  "“수익률 연 15% 보장, 이건 기회예요.”",
  "“오늘 안 하시면 내일은 이 가격에 못 드려요.”",
  "“벌써 완판 임박입니다. 마지막 한 채예요!”",
  "“사모님들 사이에서 난리 난 바로 그 매물입니다.”",
  "“대출 규제 피해서 나온 특수 물량이에요.”"
];

const RealEstateFraudExperience: React.FC = () => {
  const [step, setStep] = useState(0); // 0 to 3
  const [activeFomo, setActiveFomo] = useState<{ id: number; text: string; top: number; left: number }[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // 멘트 추가 함수 (재사용성 및 즉각적 반응을 위해 분리)
  const addFomoMessage = useCallback(() => {
    const msg = FOMO_MESSAGES[Math.floor(Math.random() * FOMO_MESSAGES.length)];
    const newFomo = {
      id: Date.now() + Math.random(),
      text: msg,
      // 주로 서명란 주변이나 화면 하단부에 배치하여 본문 가독성 저해 최소화
      top: 30 + Math.random() * 55, 
      left: 5 + Math.random() * 75
    };
    setActiveFomo(prev => [...prev.slice(-4), newFomo]); // 최대 5개 유지
  }, []);

  // 배경에서 속삭이는 듯한 효과 (기존 로직 유지하되 클릭 시와 중첩)
  useEffect(() => {
    if (step > 0 && step < 3 && !isRevealed) {
      const interval = setInterval(addFomoMessage, 3000);
      return () => clearInterval(interval);
    } else {
      setActiveFomo([]);
    }
  }, [step, isRevealed, addFomoMessage]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
      // 버튼 클릭 즉시 멘트 출력 (반응성 강화)
      addFomoMessage();
      // 연달아 두 개가 나오게 하여 압박감 조성
      setTimeout(addFomoMessage, 150);
    }
  };

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setIsRevealed(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F7F7F7] overflow-hidden flex flex-col font-serif">
      {/* 1단계: 실제 계약서 배경 (모든 조항 유지, 축소된 글씨 크기 적용) */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 transition-all duration-1000 ${isRevealed ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <div className="max-w-4xl mx-auto bg-white shadow-[0_10px_50px_rgba(0,0,0,0.05)] p-10 md:p-16 lg:p-20 border border-zinc-200 relative receipt-paper-texture">
          
          <header className="text-center mb-16 border-b border-zinc-900 pb-8">
            <h1 className="text-2xl md:text-3xl font-black tracking-[0.15em] uppercase text-zinc-900 leading-tight">표준 부동산 매매 및 분양 계약서</h1>
            <p className="text-[10px] mt-4 font-sans font-bold text-zinc-400 tracking-[0.4em] uppercase">DOCUMENT REF: 2025-SECURE-AUTH-X</p>
          </header>

          <div className="space-y-12 text-[16px] md:text-[17px] leading-[1.8] text-zinc-700 text-justify">
            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 1 조 (목적)</h3>
              <p>본 계약은 매도인(이하 "갑")이 소유한 목적물을 매수인(이하 "을")에게 분양함에 있어 필요한 제반 사항을 명확히 규정함을 목적으로 한다.</p>
            </section>
            
            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 2 조 (분양 목적물의 표시)</h3>
              <p>"갑"은 계약서 상에 기재된 소재지 및 면적의 건축물을 "을"에게 공급하며, "을"은 해당 물건의 권리 관계 및 현장 상태를 충분히 인지한 상태에서 계약한다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 3 조 (대금 지급 조건)</h3>
              <p>"을"은 총 계약 대금을 지정된 계좌로 정해진 기한 내에 입금하여야 한다. 모든 납부는 무통장 입금을 원칙으로 하며, "갑"의 공식 계좌가 아닌 곳으로 입금된 금액은 인정하지 않는다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 4 조 (지연 손해금)</h3>
              <p>"을"이 중도금 및 잔금 납입을 지연할 경우, 납입 지연 일수에 따라 연 15%의 지연 이자가 가산된다. 이는 연체 시점부터 매일 산정된다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 5 조 (소유권 이전)</h3>
              <p>"갑"은 잔금 수령과 동시에 "을"에게 소유권 이전에 필요한 일체의 서류를 인도한다. 단, 등기 절차에 필요한 취득세 및 수수료는 "을"의 전액 부담으로 한다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 6 조 (시설물의 유지 관리)</h3>
              <p>"을"은 인도받은 시설물을 선량한 관리자의 주의 의무로 유지 관리해야 하며, 불법 개조나 구조 변경으로 발생하는 모든 책임은 "을"에게 귀속된다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 7 조 (계약의 해제 및 해지)</h3>
              <p>"을"이 대금 납입을 30일 이상 지연하거나 본 계약 조건을 위반할 경우, "갑"은 서면 통지 후 즉시 계약을 일방적으로 해제할 수 있다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 8 조 (위약금)</h3>
              <p>본 계약이 "을"의 귀책사유로 해제될 경우, 기 납부된 계약금은 "갑"에게 귀속되며 "을"은 어떠한 반환 청구도 할 수 없다.</p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-4 font-sans border-b border-zinc-100 pb-2">제 9 조 (분쟁의 해결)</h3>
              <p>본 계약과 관련하여 발생하는 모든 분쟁은 관할 법원을 통하여 해결하며, 법적 해석의 차이가 있을 경우 "갑"의 해석을 우선으로 한다.</p>
            </section>

            <section className="bg-zinc-50 p-8 border border-zinc-100 rounded shadow-inner">
              <h3 className="text-lg md:text-xl font-black text-red-600 mb-4 font-sans">제 10 조 (특약사항 및 면책조항)</h3>
              <p className="font-bold text-zinc-800 underline underline-offset-4 decoration-red-100 text-[15px] md:text-[16px]">
                인근 인프라 확충 및 수익률 보장 등 광고에 사용된 문구는 미래의 예측치로, 상황에 따라 변경될 수 있으며 이에 대해 "갑"은 어떠한 민·형사상의 책임도 지지 않는다. "을"은 본 광고 내용을 근거로 계약 해제나 손해 배상을 청구할 수 없음을 명확히 인지하고 서명한다.
              </p>
            </section>
          </div>

          {/* 서명란 인터랙션 */}
          <div className="mt-24 pt-12 border-t border-dashed border-zinc-200 flex flex-col items-end gap-8">
            <div className="text-right">
              <p className="text-[11px] font-sans font-black text-zinc-400 uppercase tracking-widest mb-4">수분양자 성명 및 서명 (인)</p>
              <div className="w-72 h-28 border-b border-zinc-900 relative bg-zinc-50/40 flex items-center justify-center overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 112">
                  <path 
                    d="M40 56 Q 70 20, 100 70 T 150 56" 
                    fill="none" 
                    stroke="#18181b" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${step >= 1 ? 'stroke-dashoffset-0' : 'stroke-dasharray-[350] stroke-dashoffset-[350]'}`}
                    style={{ strokeDasharray: 350, strokeDashoffset: step >= 1 ? 0 : 350 }}
                  />
                  <path 
                    d="M150 56 Q 180 90, 220 40 T 250 70" 
                    fill="none" 
                    stroke="#18181b" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className={`transition-all duration-1000 delay-300 ${step >= 2 ? 'stroke-dashoffset-0' : 'stroke-dasharray-[350] stroke-dashoffset-[350]'}`}
                    style={{ strokeDasharray: 350, strokeDashoffset: step >= 2 ? 0 : 350 }}
                  />
                  {step >= 3 && (
                    <circle cx="250" cy="56" r="20" fill="none" stroke="#dc2626" strokeWidth="3" className="animate-in fade-in zoom-in duration-700" />
                  )}
                  {step >= 3 && (
                    <text x="240" y="63" fontSize="16" fontWeight="900" fill="#dc2626" className="animate-in fade-in duration-1000 font-sans">印</text>
                  )}
                </svg>
                {step === 0 && <span className="text-[10px] text-zinc-300 font-sans font-black uppercase tracking-widest">Digital Signature Area</span>}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-5">
               <button
                onClick={handleNextStep}
                disabled={step >= 3}
                className={`px-12 py-5 bg-zinc-900 text-white font-black text-[11px] tracking-[0.4em] uppercase shadow-lg transition-all active:scale-95 ${step >= 3 ? 'opacity-20 grayscale' : 'hover:bg-teal-700 hover:shadow-teal-900/10'}`}
              >
                {step === 0 ? "서명하기" : step === 3 ? "처리 완료" : `진행 단계 (${step}/3)`}
              </button>
              <p className="text-[10px] font-sans font-bold text-zinc-300 uppercase tracking-widest">Validated via Electronic Contract Act</p>
            </div>
          </div>
        </div>
      </div>

      {/* 유혹 멘트 팝업 (버튼 클릭 시 즉각 반응) */}
      {!isRevealed && activeFomo.map((fomo) => (
        <div 
          key={fomo.id} 
          className="fixed z-[150] bg-white/95 backdrop-blur-sm text-zinc-900 px-5 py-3 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300 pointer-events-none"
          style={{ top: `${fomo.top}%`, left: `${fomo.left}%` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[13px] font-bold font-sans tracking-tight leading-none">{fomo.text}</span>
        </div>
      ))}

      {/* 최종 반전 오버레이 (강렬한 효과 유지) */}
      <div 
        className={`fixed inset-0 z-[500] bg-[#0A0A0A] flex flex-col items-center justify-center transition-all duration-1000 ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-scanlines opacity-40 pointer-events-none" />
        
        <div className="max-w-4xl w-full px-12 text-center space-y-12">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-[6px] border-red-600 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#dc2626" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.854 4.146-4 4a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 7.793l3.646-3.647a.5.5 0 0 1 .708.708z"/></svg>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-zinc-600 text-[10px] font-black tracking-[1em] uppercase">ACCESS DENIED // DATA BREACH</h2>
            <h3 className="text-5xl md:text-8xl font-black text-red-600 tracking-tighter italic leading-none">
              FRAUD.
            </h3>
            <div className="h-px w-24 bg-red-600/40 mx-auto" />
            <p className="text-xl md:text-4xl font-serif font-black text-zinc-100 leading-tight whitespace-pre-line drop-shadow-2xl">
              당신은 분양 사기에 연루되었습니다.{"\n"}송금된 계약금 전액은{"\n"}반환되지 않습니다.
            </p>
          </div>

          <div className="pt-20">
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.5em] uppercase border-t border-zinc-900 pt-8 inline-block">
              현실의 비극을 바탕으로 재구성한 기획 리포트입니다.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-paper-texture {
          background-image: radial-gradient(#EFEFEF 0.8px, transparent 0);
          background-size: 24px 24px;
        }
        .bg-scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.25) 50%
          );
          background-size: 100% 4px;
        }
      `}</style>
    </div>
  );
};

export default RealEstateFraudExperience;
