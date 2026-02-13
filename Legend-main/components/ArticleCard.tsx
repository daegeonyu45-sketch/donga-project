import React, { useState, useEffect } from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: (id: string) => void;
  isDarkMode?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, isDarkMode }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = 'https://images.unsplash.com/photo-1585829365234-781f8c4847c1?q=80&w=1000&auto=format&fit=crop';

  useEffect(() => {
    setImgError(false);
  }, [article.id, article.thumbnail]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(article.id);
  };

  const isInteractive = article.category === '인터랙티브' || article.isInteractive;

  if (isInteractive) {
    return (
      <div 
        className="group cursor-pointer pb-6 mb-6 last:border-0 transition-all duration-300 hover:-translate-y-[4px] active:scale-[0.98] px-2"
        onClick={handleCardClick}
      >
        <div className={`relative overflow-hidden mb-4 rounded-[4px] shadow-[0_10px_20px_-12px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.05)] group-hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-500 border-t border-l border-white/20 min-h-[200px] flex ${isDarkMode ? 'bg-[#2a3746]' : 'bg-[#FDFDFD]'}`}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 shadow-[0_0_10px_rgba(0,0,0,0.1)] z-10" />
          <div className="w-1/2 relative overflow-hidden border-r border-black/5">
            <img 
              src={(!article.thumbnail || imgError) ? fallbackImg : article.thumbnail} 
              alt={article.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-40" />
          </div>
          <div className="w-1/2 p-4 flex flex-col justify-center gap-2 relative z-20">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-[#00928e] text-white px-2 py-0.5 rounded-[2px] uppercase tracking-widest meta-text">
                Interactive
              </span>
            </div>
            <h3 className={`text-sm md:text-base headline-text font-black leading-tight line-clamp-2 ${isDarkMode ? 'text-[#FFFFFF]' : 'text-zinc-900'}`}>
              {article.title}
            </h3>
            <div className={`w-6 h-[1px] ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
            {/* 메인 카드에서는 요약(summary)만 노출 */}
            <p className={`line-clamp-3 text-[11px] body-text font-medium ${isDarkMode ? 'text-[#F5F5F5]' : 'text-zinc-500'}`}>
              {article.summary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group cursor-pointer pb-6 mb-6 transition-all duration-300 hover:-translate-y-[2px] active:scale-[0.98] px-2"
      onClick={handleCardClick}
    >
      <div className={`flex flex-col gap-4 p-5 rounded-xl border ${isDarkMode ? 'bg-[#1a2430] border-zinc-700 shadow-lg' : 'bg-white border-gray-100 shadow-sm'} transition-all group-hover:shadow-md min-h-[320px]`}>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img 
            src={(!article.thumbnail || imgError) ? fallbackImg : article.thumbnail} 
            alt={article.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest meta-text ${isDarkMode ? 'text-[#1a6361]' : 'text-[#00928e]'}`}>
              {article.category}
            </span>
            <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-100'}`}></div>
          </div>
          <h3 className={`text-base md:text-lg headline-text font-bold leading-snug line-clamp-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {article.title}
          </h3>
          {/* 메인 카드에서는 요약(summary)만 노출 */}
          <p className={`line-clamp-2 text-xs body-text ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {article.summary}
          </p>
        </div>
      </div>
      <style>{`
        .headline-text { font-family: 'Noto Serif KR', serif !important; letter-spacing: -0.02em !important; }
        .body-text { font-family: 'Noto Sans KR', sans-serif !important; line-height: 1.6 !important; }
        .meta-text { font-family: 'Noto Sans KR', sans-serif !important; letter-spacing: 0.05em !important; }
      `}</style>
    </div>
  );
};

export default ArticleCard;