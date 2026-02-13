
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Share2, MessageCircle, Heart, Newspaper, Trash2, Send, ShieldCheck, Award, X, Copy } from 'lucide-react';

const LoadingSpinnerIcon = ({ size, className }: { size: number, className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
  </svg>
);

interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  image: string | null;
  date: string;
  factCheck: string;
  likes?: number;
  comments?: Comment[];
  summary?: string;
}

const RealtimeNews: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const fetchArticles = () => {
    try {
      // ★ 사용자 요청에 따라 'dashboard_db' 키를 사용합니다.
      const savedRaw = localStorage.getItem('dashboard_db');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const initialized = saved.map((a: Article) => ({
        ...a,
        likes: a.likes || 0,
        comments: a.comments || []
      }));
      setArticles(initialized);
    } catch (e) {
      console.error("Failed to load articles from localStorage", e);
    }
  };

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 3000);
    return () => clearInterval(interval);
  }, []);

  const deleteArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("이 기사를 영구적으로 삭제하시겠습니까?")) return;
    
    try {
      const savedRaw = localStorage.getItem('dashboard_db');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const updated = saved.filter((a: any) => a.id !== id);
      localStorage.setItem('dashboard_db', JSON.stringify(updated));
      setArticles(updated);
      if (selectedArticle?.id === id) setSelectedArticle(null);
    } catch (e) {
      console.error("Deletion failed", e);
    }
  };

  const updateArticleInStorage = (updatedArticle: Article) => {
    try {
      const savedRaw = localStorage.getItem('dashboard_db');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const newArticles = saved.map((a: any) => a.id === updatedArticle.id ? updatedArticle : a);
      localStorage.setItem('dashboard_db', JSON.stringify(newArticles));
      setArticles(newArticles.map((a: Article) => ({
          ...a,
          likes: a.likes || 0,
          comments: a.comments || []
      })));
      if (selectedArticle?.id === updatedArticle.id) {
        setSelectedArticle(updatedArticle);
      }
    } catch (e) {
      console.error("Storage update failed", e);
    }
  };

  const handleLike = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    const updated = { ...article, likes: (article.likes || 0) + 1 };
    updateArticleInStorage(updated);
  };

  const handleShare = async (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${article.title}\nhttps://www.donga.com`);
      alert("기사 링크가 복사되었습니다.");
    } catch (err) {
      alert("복사 실패");
    }
  };

  const handleCopy = () => {
    if (!selectedArticle) return;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = selectedArticle.content;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";
    const fullText = `${selectedArticle.title}\n\n${plainText}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      alert("✅ 기사 내용이 클립보드에 복사되었습니다.");
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  };

  const handleAddComment = () => {
    if (!selectedArticle || !commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: `익명_${Math.floor(Math.random() * 9000) + 1000}`,
      text: commentInput,
      date: "방금 전"
    };

    const updated = {
      ...selectedArticle,
      comments: [newComment, ...(selectedArticle.comments || [])]
    };

    updateArticleInStorage(updated);
    setCommentInput("");
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="d-flex align-items-center justify-content-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h2 className="fw-black mb-1 flex items-center gap-3 text-3xl">
            <div className="bg-red-600 px-3 py-1 rounded text-white text-[10px] font-black animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)] uppercase tracking-widest">LIVE</div>
            📡 실시간 보도 파이프라인
          </h2>
          <p className="text-slate-500 text-sm m-0">AI 편집국에서 전송된 최신 속보를 실시간으로 브리핑합니다.</p>
        </div>
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Status</p>
            <p className="text-green-500 font-bold text-xs flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div> FEED ACTIVE</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {articles.length === 0 ? (
          <div className="col-12">
            <div className="glass-card p-20 rounded-[40px] text-center border-dashed border-slate-800 flex flex-col items-center justify-center bg-slate-900/20 min-h-[500px]">
               <Newspaper size={100} className="mb-6 text-slate-800 opacity-30" />
               <h3 className="text-slate-500 fw-black text-2xl mb-3">현재 대기 중인 속보가 없습니다</h3>
               <p className="text-slate-600 max-w-sm">기자실에서 기사를 작성하고 저장하면 이곳에 실시간으로 뉴스가 도착합니다.</p>
            </div>
          </div>
        ) : (
          <div className="col-12">
            <div className="d-flex flex-column gap-6">
              {articles.map((article, idx) => (
                <div 
                  key={article.id} 
                  className={`newspaper-feed-item group cursor-pointer transition-all ${idx === 0 ? 'top-story' : ''}`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className={`row g-0 rounded-[32px] overflow-hidden border transition-all duration-500 ${idx === 0 ? 'bg-slate-900 border-red-600/30 ring-1 ring-red-600/20' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}>
                    <div className="col-md-5 position-relative overflow-hidden">
                      {article.image ? (
                        <img src={article.image} alt="news" className="w-100 h-100 object-cover group-hover:scale-110 transition-transform duration-1000 min-h-[300px]" />
                      ) : (
                        <div className="w-100 h-100 bg-slate-900 flex items-center justify-center text-slate-800 min-h-[300px]"><Newspaper size={60} /></div>
                      )}
                      {idx === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 md:hidden">
                           <span className="badge bg-red-600 px-3 py-2 text-[10px] font-black tracking-widest uppercase">BREAKING NOW</span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-7 p-6 md:p-8 flex flex-col">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-red-500 text-[10px] font-black uppercase tracking-[2px]">{article.category}</span>
                          {idx === 0 && <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black animate-pulse">속보</span>}
                        </div>
                        <span className="text-slate-500 text-[11px] font-bold flex items-center gap-1 opacity-60 uppercase"><Clock size={12} /> {article.date}</span>
                      </div>
                      <h3 className={`text-white fw-black mb-4 tracking-tighter group-hover:text-red-500 transition-colors leading-tight ${idx === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{article.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 opacity-80 flex-grow">
                        {article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                      </p>
                      <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <button onClick={(e) => handleLike(e, article)} className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors border-0 bg-transparent p-0">
                            <Heart size={14} className={article.likes && article.likes > 0 ? "fill-red-500 text-red-500 border-0" : ""} />
                            <span className="text-[11px] font-black">{article.likes || 0}</span>
                          </button>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <MessageCircle size={14} />
                            <span className="text-[11px] font-black">{article.comments?.length || 0}</span>
                          </div>
                          <button onClick={(e) => handleShare(e, article)} className="text-slate-500 hover:text-blue-500 transition-colors border-0 bg-transparent p-0">
                            <Share2 size={14} />
                          </button>
                        </div>
                        <span className="text-white text-[11px] font-black flex items-center gap-2 group-hover:translate-x-1 transition-transform uppercase">Full Story <ChevronRight size={14} className="text-red-500" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="py-12 text-center opacity-30">
               <div className="inline-flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-full border border-slate-800">
                  <LoadingSpinnerIcon size={16} className="animate-spin text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Checking for live updates...</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in" onClick={() => setSelectedArticle(null)}>
          <div className="bg-slate-900 w-full max-w-5xl max-h-[92vh] rounded-[40px] overflow-hidden border border-slate-800 flex flex-col shadow-3xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 md:h-[450px] flex-shrink-0">
              {selectedArticle.image ? (
                <img src={selectedArticle.image} alt="Full" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-900"><Newspaper size={120} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <button className="absolute top-8 right-8 w-12 h-12 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-xl" onClick={() => setSelectedArticle(null)}>
                <X className="text-white" size={24} />
              </button>
              <div className="absolute bottom-10 left-10 right-10">
                 <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 px-4 py-1.5 text-[10px] font-black shadow-lg rounded tracking-widest uppercase">{selectedArticle.category}</span>
                    <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold text-slate-300 flex items-center gap-2 border border-white/10"><Clock size={12} /> {selectedArticle.date}</span>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] drop-shadow-2xl tracking-tighter">{selectedArticle.title}</h1>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
               <div className="p-8 md:p-16">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-12 p-6 rounded-3xl bg-slate-900 border-l-4 border-red-600 shadow-xl">
                       <h6 className="text-red-500 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} /> Summary & Fact Check</h6>
                       <p className="text-white text-lg font-bold leading-relaxed m-0 italic">"{selectedArticle.summary || '본 기사의 핵심 내용을 요약 중입니다.'}"</p>
                       <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase">
                          <ShieldCheck size={14} className="text-green-500" /> Validation Status: <span className="text-green-500">{selectedArticle.factCheck || 'AI Verification Complete'}</span>
                       </div>
                    </div>
                    
                    <div 
                        className="article-rich-text text-slate-200 text-xl leading-[2.1] space-y-8"
                        style={{ fontFamily: "'Pretendard', sans-serif" }}
                        dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                      />

                    <div className="mt-20 pt-16 border-t border-slate-800">
                       <div className="flex items-center justify-between mb-10">
                          <h3 className="text-white fw-black text-2xl m-0 flex items-center gap-3">시청자 반응 <span className="text-slate-600 text-lg">{selectedArticle.comments?.length || 0}</span></h3>
                          <div className="flex items-center gap-4">
                             <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 border border-blue-500/30 text-white hover:bg-blue-500 transition-all">
                                <Copy size={18} /> 기사 복사
                             </button>
                             <button onClick={(e) => handleLike(e, selectedArticle)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 transition-all">
                                <Heart size={18} className={selectedArticle.likes && selectedArticle.likes > 0 ? "fill-red-500 text-red-500 border-0" : ""} /> {selectedArticle.likes || 0}
                             </button>
                             <button onClick={(e) => handleShare(e, selectedArticle)} className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"><Share2 size={18}/></button>
                          </div>
                       </div>

                       <div className="bg-slate-900/50 p-6 rounded-[28px] border border-slate-800 mb-10 shadow-inner">
                          <div className="d-flex gap-4">
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 text-white font-black shadow-lg">나</div>
                             <div className="flex-grow-1 position-relative">
                                <textarea 
                                  className="form-control !bg-slate-950 border-slate-800 text-white rounded-2xl p-4 h-28 focus:ring-2 focus:ring-red-600/50 transition-all resize-none shadow-lg"
                                  placeholder="기사에 대한 생각을 자유롭게 남겨주세요..."
                                  value={commentInput}
                                  onChange={(e) => setCommentInput(e.target.value)}
                                />
                                <button 
                                  onClick={handleAddComment}
                                  className="btn btn-primary position-absolute bottom-4 end-4 rounded-xl py-2 px-5 font-black flex items-center gap-2 shadow-2xl border-0"
                                  disabled={!commentInput.trim()}
                                >
                                  <Send size={16}/> 댓글 등록
                                </button>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                            selectedArticle.comments.map((comment) => (
                              <div key={comment.id} className="comment-bubble d-flex gap-4 animate-fade-in">
                                 <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-700">익명</div>
                                 <div className="flex-grow-1">
                                    <div className="d-flex items-center gap-3 mb-2">
                                       <span className="text-white font-bold text-sm">익명 시청자</span>
                                       <span className="text-slate-600 text-[10px] font-bold uppercase">{comment.date}</span>
                                    </div>
                                    <div className="text-slate-300 text-base leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 shadow-sm">
                                       {comment.text}
                                    </div>
                                 </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 opacity-20">
                               <p className="m-0 font-black tracking-widest uppercase text-xs">No comments yet. Start the conversation!</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="p-8 bg-slate-900 border-t border-slate-800 d-flex justify-content-between items-center">
               <button onClick={(e) => deleteArticle(selectedArticle.id, e)} className="text-red-500 font-bold flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-xl transition-all border-0 bg-transparent">
                  <Trash2 size={18}/> 기사 영구 삭제
               </button>
               <button className="btn btn-primary px-12 py-3 font-black rounded-2xl shadow-xl shadow-blue-900/20 border-0" onClick={() => setSelectedArticle(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .article-rich-text p { margin-bottom: 2rem; }
        .article-rich-text h3 { color: white; font-weight: 900; font-size: 1.8rem; margin-top: 3.5rem; margin-bottom: 1.5rem; letter-spacing: -0.5px; }
        .article-rich-text b { color: white; font-weight: 800; }
        .top-story { margin-bottom: 2rem; }
        .newspaper-feed-item:hover { transform: scale(1.005); }
        .newspaper-feed-item { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default RealtimeNews;
