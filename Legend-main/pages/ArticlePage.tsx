
import React, { useEffect, useRef, useState } from 'react';
import { Article } from '../types';
import { ARTICLES } from '../constants';
import ExperienceSection from '../components/ExperienceSection';
import RealEstateFraudExperience from '../components/RealEstateFraudExperience';
import SeongsuBridgeExperience from '../components/SeongsuBridgeExperience';
import AIJobsExperience from '../components/AIJobsExperience';
import PriceCollusionExperience from '../components/PriceCollusionExperience';
import NeuralinkExperience from '../components/NeuralinkExperience';
import ChurchMysteryExperience from '../components/ChurchMysteryExperience';
import AITemptationExperience from '../components/AITemptationExperience';

interface ArticlePageProps {
  article: Article;
  onBack: () => void;
  onArticleSelect?: (id: string) => void;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ article, onBack, onArticleSelect }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.id]);

  const isInteractive = article.category === '인터랙티브' || article.isInteractive;
  
  const isRealEstateFraudArticle = article.id === 'real-estate-fraud-01';
  const isSeongsuBridgeArticle = article.id === 'seongsu-bridge-1994';
  const isClimateArticle = article.id === 'energy-crisis-03';
  const isAIJobsArticle = article.id === 'ai-jobs-impact';
  const isPriceCollusionArticle = article.id === 'price-collusion-2026';
  const isNeuralinkArticle = article.id === 'neuralink-001' || article.title.includes('뉴럴링크');
  const isChurchMysteryArticle = article.id === 'church-mystery-001';
  const isAITemptationArticle = article.id === 'ai-temptation-001';

  const onPointerDown = (e: React.PointerEvent) => {
    if (isInteractive) return;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartPos.current) return;
    setDragOffset(e.clientX - dragStartPos.current.x);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !onArticleSelect) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const width = containerRef.current.offsetWidth;
    const progress = Math.abs(dragOffset) / width;

    if (progress >= 0.22) {
      const currentIndex = ARTICLES.findIndex(a => a.id === article.id);
      if (dragOffset < 0) { // Next
        if (currentIndex < ARTICLES.length - 1) onArticleSelect(ARTICLES[currentIndex + 1].id);
      } else { // Prev
        if (currentIndex > 0) onArticleSelect(ARTICLES[currentIndex - 1].id);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    dragStartPos.current = null;
  };

  const CloseReportButton = (
    <div className="fixed bottom-8 right-8 z-[600]">
      <button 
        onClick={onBack} 
        className={`px-10 py-5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-2xl transition-all active:scale-95 whitespace-nowrap ${
          isNeuralinkArticle ? 'bg-[#00F0FF] text-black hover:bg-white' : 'bg-black text-white hover:bg-zinc-800'
        }`}
      >
        BACK TO NEWSPAPER
      </button>
    </div>
  );

  if (isInteractive) {
    if (isSeongsuBridgeArticle) return <><SeongsuBridgeExperience onBack={onBack} />{CloseReportButton}</>;
    if (isClimateArticle) return <div className="fixed inset-0 bg-white z-[100]"><ExperienceSection />{CloseReportButton}</div>;
    if (isChurchMysteryArticle) return <div className="fixed inset-0 bg-white z-[100] overflow-hidden"><ChurchMysteryExperience />{CloseReportButton}</div>;
    if (isAITemptationArticle) return <div className="fixed inset-0 z-[100] overflow-y-auto"><AITemptationExperience />{CloseReportButton}</div>;
    
    // 분양사기 (Real Estate Fraud) 전용 Full Screen 테마
    if (isRealEstateFraudArticle) {
      return (
        <div className="fixed inset-0 z-[100] bg-white font-sans overflow-hidden flex flex-col">
          <div className="relative z-[200] px-6 py-6 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex justify-between items-center">
            <button onClick={onBack} className="flex items-center gap-3 text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase hover:text-zinc-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
              BACK TO NEWSPAPER
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-300 tracking-widest uppercase">INTERACTIVE CONTRACT SIMULATION</span>
              <span className="text-[12px] font-serif font-black text-zinc-900 tracking-tighter">{article.title}</span>
            </div>
          </div>
          <div className="flex-1">
            <RealEstateFraudExperience />
          </div>
          {CloseReportButton}
        </div>
      );
    }

    if (isAIJobsArticle) return <div className="fixed inset-0 bg-black z-[100] overflow-hidden"><AIJobsExperience />{CloseReportButton}</div>;
    if (isPriceCollusionArticle) return <div className="fixed inset-0 bg-white z-[100] overflow-y-auto"><div className="max-w-5xl mx-auto px-4 py-20"><PriceCollusionExperience /></div>{CloseReportButton}</div>;
    
    // Neuralink Special Rendering (Full Screen Theme)
    if (isNeuralinkArticle) {
      return (
        <div className="fixed inset-0 z-[100] bg-[#08080C] font-sans overflow-hidden flex flex-col">
          {/* Top Bar for Neuralink */}
          <div className="relative z-50 px-6 py-6 border-b border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center">
            <button onClick={onBack} className="flex items-center gap-3 text-[10px] font-black tracking-[0.4em] text-[#00F0FF] uppercase hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
              BACK TO NEWSPAPER
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">INTERACTIVE SIMULATION</span>
              <span className="text-[12px] font-serif font-black text-[#00F0FF] tracking-tighter">{article.title}</span>
            </div>
          </div>

          {/* Full Interactive Experience Area */}
          <div className="flex-1">
            <NeuralinkExperience />
          </div>
          
          {CloseReportButton}
        </div>
      );
    }

    return <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">인터랙티브 콘텐츠를 불러오는 중...{CloseReportButton}</div>;
  }

  // Normal Article Detail
  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#f3f4f6] selection:bg-red-100 font-sans relative overflow-hidden select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: 'none' }}
    >
      {isDragging && dragOffset !== 0 && (
         <div 
          className={`fixed inset-0 z-[60] origin-${dragOffset < 0 ? 'left' : 'right'} bg-white pointer-events-none transition-transform duration-100 shadow-2xl`} 
          style={{ transform: `rotateY(${Math.max(-45, Math.min(45, dragOffset / 15))}deg)`, borderRight: dragOffset < 0 ? '1px solid rgba(0,0,0,0.1)' : 'none', borderLeft: dragOffset > 0 ? '1px solid rgba(0,0,0,0.1)' : 'none' }} 
         />
      )}

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-black transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="transform group-hover:-translate-x-1 transition-transform">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            BACK TO HOME
          </button>
          <div className="text-[13px] font-black tracking-[0.3em] text-[#00928e] uppercase cursor-pointer hover:opacity-80" style={{ WebkitTextStroke: '0.6px currentColor' }} onClick={onBack}>
            Digital Edition • 동아일분
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 flex justify-center">
        <article className="w-full max-w-[800px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-200 p-10 md:p-16 relative">
          <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
            <span className="bg-[#00928e] text-white px-3 py-1 text-[10px] font-black rounded-sm uppercase tracking-widest">{article.category}</span>
            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">AI DAILY SPECIAL</span>
          </div>
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-zinc-900 leading-[1.1] tracking-tighter mb-8">{article.title}</h1>
            <div className="h-0.5 w-16 bg-[#00928e] mb-8" />
          </header>
          <figure className="mb-12 group">
            <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100 mb-4 shadow-sm border border-gray-100">
              <img 
                src={article.thumbnail} 
                alt={article.title} 
                className={`w-full h-full object-cover transition-transform duration-300 ${article.thumbnail ? 'scale-100 group-hover:scale-115' : ''}`} 
              />
            </div>
            <figcaption className="text-[11px] font-bold text-zinc-400 italic tracking-tight leading-relaxed">{article.caption || `[사진] ${article.title} 관련 기록 이미지`}</figcaption>
          </figure>
          <section className="space-y-8">
            {article.lead && <p className="text-xl md:text-2xl font-serif font-bold text-zinc-600 leading-snug tracking-tight mb-12 border-l-4 border-zinc-100 pl-6 py-2">{article.lead}</p>}
            <div className="space-y-6 text-lg text-zinc-800 leading-[1.8] font-serif">
              {article.body.map((paragraph, idx) => (<p key={idx} className={`${idx === 0 ? 'first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8] first-letter:text-[#00928e]' : ''}`}>{paragraph}</p>))}
            </div>
          </section>
          <footer className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">
            <div className="cursor-pointer hover:opacity-80 text-[12px]" style={{ WebkitTextStroke: '0.4px currentColor' }} onClick={onBack}>© 2026 DONGA-ILBUN DIGITAL</div>
            <div>Authorized Press</div>
          </footer>
        </article>
      </div>
      {CloseReportButton}
      <style>{`
        * { font-family: 'Noto Sans KR', sans-serif !important; }
        .font-serif, h1, h2, h3, article p, article h1, article header p { font-family: 'Nanum Myeongjo', serif !important; }
      `}</style>
    </div>
  );
};

export default ArticlePage;
