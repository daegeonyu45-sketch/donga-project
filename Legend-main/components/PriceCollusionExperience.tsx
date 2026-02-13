import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Product {
  id: string;
  name: string;
  price: number;
  icon: string;
  bgColor: string;
}

const PRODUCTS: Product[] = [
  { id: 'flour', name: '밀가루 1kg', price: 2500, icon: '🌾', bgColor: '#F5F5DC' },
  { id: 'sugar', name: '설탕 1kg', price: 2800, icon: '🧂', bgColor: '#E0F7FA' },
  { id: 'bread', name: '우유 식빵', price: 3500, icon: '🍞', bgColor: '#F5E6D3' },
  { id: 'ramen', name: '라면 (5개입)', price: 4500, icon: '🍜', bgColor: '#FFF9C4' },
];

interface CartItem extends Product {
  quantity: number;
}

const PriceCollusionExperience: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [lineReveal, setLineReveal] = useState<number>(0);

  // [핵심 로직 보존 및 업데이트] 담합 차액 및 체감 비교 계산
  const stats = useMemo(() => {
    const currentTotal = cart.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    // 담합이 없었을 경우를 약 25% 낮은 가격으로 산정
    const honestTotal = Math.round(currentTotal * 0.75 / 10) * 10;
    const diff = currentTotal - honestTotal;
    
    let comparison = "";
    let compIcon = "";
    if (diff > 0) {
      if (diff < 2000) {
        comparison = "시원한 생수 한 병을 더 마실 수 있었던 금액입니다.";
        compIcon = "🥤";
      } else if (diff < 5000) {
        comparison = "따뜻한 아메리카노 한 잔을 더 즐길 수 있었던 금액입니다.";
        compIcon = "☕";
      } else if (diff < 15000) {
        comparison = "든든한 햄버거 세트 하나를 더 먹을 수 있었던 금액입니다.";
        compIcon = "🍔";
      } else {
        comparison = "치킨 한 마리를 더 주문하고도 남을 만큼의 소중한 돈입니다.";
        compIcon = "🍗";
      }
    }

    return { currentTotal, honestTotal, diff, comparison, compIcon };
  }, [cart]);

  // [핵심 로직 보존] 영수증 출력 애니메이션
  useEffect(() => {
    if (cart.length > lineReveal) {
      const timer = setTimeout(() => setLineReveal(prev => prev + 1), 150);
      return () => clearTimeout(timer);
    }
  }, [cart, lineReveal]);

  const updateQuantity = (product: Product, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.id !== product.id);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      if (delta > 0) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
    setReport('');
    setShowWhy(false);
  };

  const resetCart = () => {
    setCart([]);
    setReport('');
    setLineReveal(0);
    setShowAnalysis(false);
    setShowWhy(false);
  };

  const generateReport = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);
    // 간소화된 리포트 생성 (AI 로직은 유지하되 결과 표시 방식 변경)
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `당신은 경제 조사관입니다. 다음 데이터를 바탕으로 한 문장으로 강력하게 고발하세요:
        - 총 담합 피해액: ${stats.diff}원
        - 이 돈으로 살 수 있었던 것: ${stats.comparison}`,
      });
      setReport(response.text || "분석 리포트를 생성할 수 없습니다.");
      setShowAnalysis(true);
    } catch (e) {
      setReport("데이터 분석 중 오류가 발생했습니다.");
      setShowAnalysis(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FA] font-sans overflow-hidden">
      <div className="relative z-10 flex flex-1 overflow-hidden">
        
        {/* 좌측: 세련된 스마트 카트 패널 */}
        <div className="w-full lg:w-[60%] p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 text-white p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 3 9h12l3-9H3z"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 leading-none">Smart Cart</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Investigative Kiosk</p>
                </div>
              </div>
              <button onClick={resetCart} className="text-[10px] font-black text-zinc-300 uppercase tracking-widest hover:text-red-500 transition-colors">Reset</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {PRODUCTS.map(p => {
                const itemInCart = cart.find(item => item.id === p.id);
                return (
                  <div 
                    key={p.id}
                    className={`flex items-center justify-between p-5 bg-white border rounded-2xl transition-all duration-300 shadow-sm ${
                      itemInCart ? 'border-zinc-900 ring-4 ring-zinc-900/5' : 'border-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* 미니멀 컬러 아이콘 (작은 크기 유지) */}
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl text-lg" style={{ backgroundColor: p.bgColor }}>
                        {p.icon}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-800">{p.name}</h3>
                        <p className="text-xs font-black text-zinc-400">{p.price.toLocaleString()}원</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-full border border-zinc-100">
                      <button onClick={() => updateQuantity(p, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full shadow-sm hover:bg-zinc-900 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span className="w-5 text-center font-black text-sm text-zinc-900">{itemInCart?.quantity || 0}</span>
                      <button onClick={() => updateQuantity(p, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full shadow-sm hover:bg-zinc-900 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* [기능 보존] 왜 올랐나요? 버튼 및 설명창 */}
            <div className="pt-6">
              <button 
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center gap-3 px-6 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-black text-[11px] uppercase tracking-widest hover:border-zinc-900 transition-all shadow-sm"
              >
                <span className="w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px]">?</span>
                왜 올랐나요? (담합 실태 보기)
              </button>
              
              <div className={`mt-4 overflow-hidden transition-all duration-500 ${showWhy ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-8 bg-zinc-900 text-white rounded-3xl space-y-3">
                  <h4 className="text-blue-400 font-black text-[10px] tracking-widest uppercase">Secret Agreement Evidence</h4>
                  <p className="text-sm leading-relaxed font-serif text-zinc-200">
                    "2020년부터 2025년까지 국내 주요 제분사와 제당사들은 원재료 가격이 하락하는 시기에도 소비자 가격을 내리지 않기로 은밀하게 약속했습니다. 이들이 부당하게 챙긴 이익은 무려 10조 원에 달하며, 이는 서민의 가계 부담으로 전가되었습니다."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 리얼리티 감열지 영수증 */}
        <div className="hidden lg:flex w-[40%] bg-zinc-200/40 border-l border-zinc-200 items-center justify-center p-8">
          <div className="relative w-full max-w-xs flex flex-col gap-6">
            <div className="relative bg-white shadow-xl overflow-hidden receipt-paper rounded-sm">
              <div className="absolute top-0 left-0 w-full h-3 bg-white receipt-edge-top z-10" />
              
              <div className="p-8 pt-12 font-mono text-[12px] text-zinc-800 leading-tight">
                <header className="text-center mb-8 pb-8 border-b border-dashed border-zinc-300">
                  <h4 className="text-lg font-black tracking-widest uppercase mb-1">Donga Mart</h4>
                  <p className="text-[10px] text-zinc-400">#SERIAL-COLLUSION-2026</p>
                </header>

                <div className="space-y-4 mb-10 min-h-[200px]">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 text-zinc-200 font-black text-sm animate-pulse tracking-widest uppercase">Scanning...</div>
                  ) : (
                    cart.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`flex justify-between items-end transition-all duration-300 ${idx < lineReveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                      >
                        <div className="flex-1">
                          <span className="font-bold text-zinc-900">{item.name}</span>
                          <div className="text-[10px] text-zinc-400">
                            {item.price.toLocaleString()} x {item.quantity}
                          </div>
                        </div>
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t-2 border-zinc-900 pt-6 space-y-3">
                  <div className="flex justify-between text-base font-black">
                    <span>총 합계</span>
                    <span>{stats.currentTotal.toLocaleString()}원</span>
                  </div>
                </div>

                {/* [기능 보존] 담합 차액 및 물품 비교 문구 */}
                {cart.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-dashed border-zinc-300 relative group">
                    <div className="bg-red-50 -mx-3 px-3 py-3 rounded-lg border border-red-100">
                      <div className="flex justify-between items-center text-[11px] font-black text-red-600">
                        <span>담합 차액</span>
                        <span>+{stats.diff.toLocaleString()}원</span>
                      </div>
                    </div>
                    
                    <div className="mt-5 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center gap-3">
                      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{stats.compIcon}</span>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Real Impact</p>
                        <p className="text-[11px] font-bold text-zinc-700 leading-tight">
                          이 차액이면 <span className="text-blue-600 underline underline-offset-2">{stats.comparison}</span>을 더 살 수 있었습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-3 bg-white receipt-edge-bottom z-10" />
            </div>

            <button
              onClick={generateReport}
              disabled={cart.length === 0 || isLoading}
              className="w-full py-5 bg-zinc-900 text-white font-black text-[11px] tracking-[0.3em] uppercase rounded-full shadow-lg hover:bg-blue-600 disabled:opacity-20 transition-all"
            >
              {isLoading ? "분석 리포트 생성 중..." : "결제 및 리포트 분석"}
            </button>
          </div>
        </div>
      </div>

      {/* [수정] 가독성이 강화된 심층 리포트 오버레이 */}
      <div 
        className={`fixed inset-0 z-[600] flex items-center justify-center transition-all duration-500 ${
          showAnalysis ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl" onClick={() => setShowAnalysis(false)} />
        <div className="relative w-full max-w-3xl bg-white shadow-2xl border border-zinc-100 rounded-[3rem] overflow-hidden p-12 md:p-20 text-center animate-in fade-in zoom-in duration-500">
          
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-red-50 text-red-600 p-6 rounded-full text-6xl mb-4 shadow-sm">
                {stats.compIcon}
              </div>
              <span className="text-[14px] font-black text-red-600 tracking-[0.5em] uppercase">Audit Report Summary</span>
            </div>

            <div className="space-y-8">
              <h3 className="text-4xl md:text-5xl font-serif font-black leading-tight tracking-tighter text-zinc-900">
                담합으로 손해 본 <span className="text-red-600 underline decoration-red-200 underline-offset-[12px]">{stats.diff.toLocaleString()}원</span>,
              </h3>
              <p className="text-2xl md:text-3xl font-serif font-bold text-zinc-800 leading-relaxed">
                {stats.comparison}
              </p>
            </div>

            <div className="h-px w-24 bg-zinc-200 mx-auto my-10" />
            
            <div className="max-w-xl mx-auto py-6 px-8 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-inner">
              <p className="text-lg md:text-xl font-serif text-zinc-600 font-medium leading-relaxed italic">
                "{report}"
              </p>
            </div>

            <div className="pt-10">
              <button 
                onClick={resetCart}
                className="px-16 py-6 bg-zinc-900 text-white font-black text-[12px] tracking-[0.4em] uppercase rounded-full shadow-lg hover:bg-blue-600 transition-all active:scale-95 hover:shadow-2xl"
              >
                새로운 분석 시작
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-paper {
          background-image: radial-gradient(#F0F0F0 1.2px, transparent 0);
          background-size: 24px 24px;
        }
        .receipt-edge-top {
          clip-path: polygon(0 100%, 2% 0, 4% 100%, 6% 0, 8% 100%, 10% 0, 12% 100%, 14% 0, 16% 100%, 18% 0, 20% 100%, 22% 0, 24% 100%, 26% 0, 28% 100%, 30% 0, 32% 100%, 34% 0, 36% 100%, 38% 0, 40% 100%, 42% 0, 44% 100%, 46% 0, 48% 100%, 50% 0, 52% 100%, 54% 0, 56% 100%, 58% 0, 60% 100%, 62% 0, 64% 100%, 66% 0, 68% 100%, 70% 0, 72% 100%, 74% 0, 76% 100%, 78% 0, 80% 100%, 82% 0, 84% 100%, 86% 0, 88% 100%, 90% 0, 92% 100%, 94% 0, 96% 100%, 98% 0, 100% 100%);
        }
        .receipt-edge-bottom {
          clip-path: polygon(0 0, 2% 100%, 4% 0, 6% 100%, 8% 0, 10% 100%, 12% 0, 14% 100%, 16% 0, 18% 100%, 20% 0, 22% 100%, 25% 0, 27.5% 100%, 30% 0, 32.5% 100%, 35% 0, 37.5% 100%, 40% 0, 42.5% 100%, 45% 0, 47.5% 100%, 50% 0, 52.5% 100%, 55% 0, 57.5% 100%, 60% 0, 62% 100%, 64% 0, 66% 100%, 68% 0, 70% 100%, 72% 0, 74% 100%, 76% 0, 78% 100%, 80% 0, 82% 100%, 84% 0, 86% 100%, 88% 0, 90% 100%, 92% 0, 94% 100%, 96% 0, 98% 100%, 100% 0);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .font-serif { font-family: 'Nanum Myeongjo', serif; }
      `}</style>
    </div>
  );
};

export default PriceCollusionExperience;