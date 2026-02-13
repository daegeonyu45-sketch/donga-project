
import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, X, FileText, Image as ImageIcon, ExternalLink, AlertTriangle, FileCheck, Award, Share2, ArrowUpRight, Newspaper, ChevronRight, Zap, TrendingUp, Quote } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'images'>('articles');
  const [articles, setArticles] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const loadData = () => {
    try {
      const savedArticles = JSON.parse(localStorage.getItem('dashboard_db') || '[]');
      const savedImages = JSON.parse(localStorage.getItem('my_images') || '[]');
      setArticles(savedArticles);
      setImages(savedImages);
    } catch (e) {
      console.error("Dashboard data load failed:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const deleteArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("이 기사를 영구적으로 삭제하시겠습니까?")) return;
    const updated = articles.filter(item => item.id !== id);
    localStorage.setItem('dashboard_db', JSON.stringify(updated));
    setArticles(updated);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const clearAll = () => {
    const targetName = activeTab === 'articles' ? '기사 전체' : '이미지 전체';
    if (!window.confirm(`${targetName}를 정말로 모두 영구 삭제하시겠습니까?`)) return;
    
    if (activeTab === 'articles') {
      localStorage.setItem('dashboard_db', '[]');
      setArticles([]);
      setSelectedItem(null);
    } else {
      localStorage.setItem('my_images', '[]');
      setImages([]);
    }
  };

  const mainStory = articles.length > 0 ? articles[0] : null;
  const leftColumnStories = articles.length > 1 ? articles.slice(1, 3) : [];
  const rightColumnStories = articles.length > 3 ? articles.slice(3, 7) : [];
  const bottomArchive = articles.length > 7 ? articles.slice(7) : [];

  return (
    <div className="h-100 p-2 text-white animate-fade-in">
      {/* Newspaper Masthead */}
      <div className="text-center mb-6 border-b-2 border-double border-slate-800 pb-6">
        <div className="flex justify-between items-end mb-4 px-4">
          <div className="hidden lg:block text-left">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EST. 1920</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI EDITION VOL. 104</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white m-0" style={{ fontFamily: 'serif' }}>
            DONGA <span className="text-blue-500">AI</span> TIMES
          </h1>
          <div className="hidden lg:block text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}<br/>
            SEOUL, KOREA
          </div>
        </div>
        <div className="border-t border-slate-800 pt-2 flex justify-between px-4 text-[9px] font-bold text-slate-400">
          <span>INDEX: POLITICS, ECONOMY, SOCIAL, TECH, ENTERTAINMENT, SPORTS</span>
          <span className="flex items-center gap-2"><Zap size={10} className="text-amber-500"/> REAL-TIME AI NEWS FEED ACTIVE</span>
          <span>SATELLITE PRICING: INTELLECTUAL VALUE</span>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-6">
        <div className="d-flex gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button 
            onClick={() => setActiveTab('articles')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all border-0 ${activeTab === 'articles' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 bg-transparent'}`}
          >
            오늘의 신문 ({articles.length})
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all border-0 ${activeTab === 'images' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 bg-transparent'}`}
          >
            포토 갤러리 ({images.length})
          </button>
        </div>
        {articles.length > 0 && activeTab === 'articles' && (
          <button onClick={clearAll} className="btn btn-link text-slate-600 text-xs font-bold no-underline hover:text-red-500 border-0">전체 삭제</button>
        )}
      </div>

      {activeTab === 'articles' ? (
        articles.length === 0 ? (
          <EmptyState message="발행된 기사가 없습니다. AI Writer에서 첫 면을 장식할 기사를 작성해보세요!" icon={<Newspaper size={48} />} />
        ) : (
          <div className="newspaper-front-page">
            <div className="row g-4">
              <div className="col-lg-3 border-r border-slate-800/50 pe-4 hidden lg:block">
                <h6 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4 border-b border-slate-800 pb-2">Editor's Choice</h6>
                <div className="space-y-6">
                  {leftColumnStories.length > 0 ? leftColumnStories.map((article, i) => (
                    <div 
                      key={article.id} 
                      className="opinion-card cursor-pointer group"
                      onClick={() => setSelectedItem(article)}
                    >
                      <span className="text-blue-500 text-[9px] font-black uppercase mb-1 block">{article.category}</span>
                      <h5 className="text-white font-bold text-base leading-snug group-hover:text-blue-400 transition-colors mb-2" style={{ fontFamily: 'serif' }}>{article.title}</h5>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed opacity-70 mb-0 font-serif">{article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 80)}</p>
                      {i !== leftColumnStories.length - 1 && <div className="h-[1px] w-1/2 bg-slate-800 mt-6 mx-auto"></div>}
                    </div>
                  )) : (
                    <div className="text-slate-700 italic text-[10px] text-center py-10">더 많은 기사를 작성하면<br/>이곳에 채워집니다.</div>
                  )}
                  
                  <div className="mt-10 p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                     <Quote size={20} className="text-slate-700 mb-2" />
                     <p className="text-[11px] text-slate-400 leading-relaxed italic m-0">"기사는 팩트의 나열이 아니라, 진실을 향한 집요한 질문이어야 한다."</p>
                     <p className="text-[9px] text-slate-600 font-black mt-2 text-right">- Donga AI Editorial</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 px-lg-4">
                {mainStory && (
                  <div 
                    className="hero-story group cursor-pointer"
                    onClick={() => setSelectedItem(mainStory)}
                  >
                    <div className="mb-4 overflow-hidden rounded-[20px] border border-slate-800 shadow-2xl relative" style={{ aspectRatio: '16/10' }}>
                      {mainStory.image ? (
                        <img src={mainStory.image} alt="main" className="w-100 h-100 object-cover group-hover:scale-105 transition-transform duration-1000" />
                      ) : (
                        <div className="w-100 h-100 bg-slate-900 flex items-center justify-center text-slate-800"><FileText size={60} /></div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-xl">Top Story</span>
                      </div>
                    </div>
                    <div className="px-1">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight group-hover:text-blue-400 transition-colors mb-4" style={{ fontFamily: 'serif' }}>
                        {mainStory.title}
                      </h2>
                      <p className="text-slate-400 text-lg leading-relaxed font-serif line-clamp-3 mb-6">
                        {mainStory.summary || mainStory.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                      </p>
                      <div className="flex items-center justify-between py-4 border-y border-slate-800/50">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1 uppercase tracking-widest"><Calendar size={12}/> {mainStory.date}</span>
                          <span className="text-green-500 flex items-center gap-1 uppercase tracking-widest"><FileCheck size={12}/> Verified</span>
                        </div>
                        <span className="text-blue-500 font-black text-[10px] flex items-center gap-1 uppercase tracking-widest">Read More <ArrowUpRight size={14}/></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-lg-3 border-l border-slate-800/50 ps-4">
                <h6 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4 border-b border-slate-800 pb-2">Latest Briefs</h6>
                <div className="space-y-5">
                  {rightColumnStories.length > 0 ? rightColumnStories.map((article) => (
                    <div 
                      key={article.id} 
                      className="brief-card group cursor-pointer border-b border-slate-800 pb-4 last:border-0 hover:translate-x-1 transition-transform"
                      onClick={() => setSelectedItem(article)}
                    >
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-blue-400 text-[8px] font-black uppercase">{article.category}</span>
                         <span className="text-slate-600 text-[8px] font-bold">{article.date.split(' ')[1]}</span>
                      </div>
                      <h6 className="text-white font-bold text-xs leading-snug group-hover:text-blue-400 transition-colors mb-0" style={{ fontFamily: 'serif' }}>{article.title}</h6>
                    </div>
                  )) : (
                    <div className="py-20 text-center opacity-20 border-2 border-dashed border-slate-900 rounded-3xl">
                       <Newspaper size={30} className="mx-auto mb-2" />
                       <p className="text-[10px] font-bold">Waiting for updates...</p>
                    </div>
                  )}
                  
                  <div className="bg-blue-600/10 p-4 rounded-xl border border-blue-500/20 mt-10">
                     <TrendingUp size={20} className="text-blue-500 mb-2" />
                     <h6 className="text-white font-black text-[10px] uppercase mb-1">AI Press System</h6>
                     <p className="text-slate-400 text-[9px] leading-relaxed mb-0">동아일보의 모든 기사는 최첨단 제미나이 엔진을 통해 팩트 검증이 이루어집니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {bottomArchive.length > 0 && (
              <div className="mt-16 pt-10 border-t-2 border-double border-slate-800">
                <div className="text-center mb-10">
                   <h4 className="text-white font-black text-xl tracking-widest uppercase inline-block bg-slate-950 px-10 relative z-10">News Archives</h4>
                   <div className="h-[1px] w-full bg-slate-800 -mt-3"></div>
                </div>
                <div className="row g-4">
                  {bottomArchive.map(article => (
                    <div key={article.id} className="col-md-6 col-xl-3">
                      <div 
                        className="archive-card group cursor-pointer bg-slate-900/20 p-4 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all h-100 flex flex-col"
                        onClick={() => setSelectedItem(article)}
                      >
                        <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-800">
                          {article.image ? (
                            <img src={article.image} className="w-100 h-100 object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-100 h-100 flex items-center justify-center text-slate-800"><FileText size={24}/></div>
                          )}
                        </div>
                        <div className="text-[8px] font-black text-blue-500 mb-1 uppercase tracking-widest">{article.category}</div>
                        <h6 className="text-white font-bold text-xs leading-snug line-clamp-2 mb-4 group-hover:text-blue-400 transition-colors flex-grow" style={{ fontFamily: 'serif' }}>{article.title}</h6>
                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-800/30">
                          <span className="text-[8px] text-slate-600 font-bold">{article.date.split(' ')[0]}</span>
                          <button onClick={(e) => deleteArticle(article.id, e)} className="p-1 text-slate-700 hover:text-red-500 transition-colors border-0 bg-transparent"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="row g-4">
          {images.length === 0 ? (
            <EmptyState message="저장된 시각 자료가 없습니다." icon={<ImageIcon size={48} />} />
          ) : (
            images.map(img => (
              <div key={img.id} className="col-md-4 col-lg-3">
                <div className="glass-card rounded-[24px] overflow-hidden border-slate-800 group shadow-xl bg-slate-900/30">
                  <div className="position-relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <img src={img.url} className="w-100 h-100 object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <button onClick={() => window.open(img.url, '_blank')} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 border-0 shadow-2xl transition-all"><ExternalLink size={18} /></button>
                       <button onClick={(e) => { e.stopPropagation(); if(window.confirm("삭제하시겠습니까?")) { const up = images.filter(i => i.id !== img.id); localStorage.setItem('my_images', JSON.stringify(up)); setImages(up); } }} className="p-3 bg-red-500/30 backdrop-blur-md rounded-full text-white hover:bg-red-500/50 border-0 shadow-2xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/80">
                    <p className="text-[9px] text-slate-300 mb-2 font-medium italic line-clamp-1 opacity-70">"{img.prompt}"</p>
                    <div className="text-[8px] text-slate-500 font-black tracking-widest">{img.date}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedItem && activeTab === 'articles' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedItem(null)}>
            <div className="rounded-[40px] shadow-3xl overflow-hidden border border-slate-800/50 flex flex-col w-full max-w-5xl max-h-[92vh]" style={{ background: '#020617' }} onClick={(e) => e.stopPropagation()}>
                <div className="p-5 px-8 border-bottom border-slate-800/50 d-flex justify-content-between align-items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                       <span className="bg-blue-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{selectedItem.category}</span>
                       <h6 className="m-0 fw-black text-white text-[11px] tracking-[0.2em] uppercase opacity-50 flex items-center gap-2"><Newspaper size={16}/> News Archive Reader</h6>
                    </div>
                    <button className="btn-close btn-close-white opacity-50 border-0 bg-transparent hover:opacity-100 transition-opacity" onClick={() => setSelectedItem(null)}></button>
                </div>
                <div className="p-6 md:p-12 overflow-auto custom-scrollbar bg-slate-950/20">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold mb-10 border-b border-slate-800 pb-6">
                            <span className="flex items-center gap-1"><Calendar size={14} className="text-blue-500"/> {selectedItem.date}</span>
                            <span className="ml-auto text-green-500 flex items-center gap-1 font-black uppercase tracking-widest text-[9px]"><FileCheck size={14} /> AI VALIDATION COMPLETE</span>
                        </div>
                        <h1 className="fw-black text-white text-5xl mb-12 tracking-tighter leading-tight" style={{ fontFamily: 'serif' }}>{selectedItem.title}</h1>
                        {selectedItem.image && (
                          <div className="mb-12 rounded-[30px] overflow-hidden shadow-2xl border border-slate-800">
                            <img src={selectedItem.image} className="img-fluid w-100" />
                          </div>
                        )}
                        <div className="text-slate-300 article-body-rich" style={{ fontSize: '1.25rem', lineHeight: '2.1', letterSpacing: '-0.3px', fontFamily: 'serif' }} dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                    </div>
                </div>
                <div className="p-6 px-10 border-top border-slate-800/50 bg-slate-900/50 d-flex justify-content-between">
                    <button className="btn btn-outline-danger px-5 rounded-2xl fw-bold flex items-center gap-2 border-0 bg-red-500/10 hover:bg-red-500/20 text-xs transition-all" onClick={() => deleteArticle(selectedItem.id)}>
                      <Trash2 size={16} /> 기사 파기
                    </button>
                    <div className="flex gap-3">
                      <button className="btn btn-slate-800 text-white px-6 rounded-2xl fw-bold border border-slate-700 text-xs" onClick={() => setSelectedItem(null)}>닫기</button>
                      <button className="btn btn-primary px-8 rounded-2xl fw-black border-0 shadow-2xl flex items-center gap-2 text-xs transition-all active:scale-95"><Share2 size={16} /> 공유</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .article-body-rich p { margin-bottom: 2.5rem; }
        .article-body-rich h3 { color: white; font-weight: 800; font-size: 1.8rem; margin-top: 3.5rem; margin-bottom: 1.5rem; font-family: 'serif'; border-bottom: 1px solid #334155; padding-bottom: 10px; }
        .hero-story:hover { transform: translateY(-2px); }
        .hero-story { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

const EmptyState = ({ message, icon }: { message: string, icon: any }) => (
  <div className="col-12">
    <div className="glass-card p-12 rounded-[40px] text-center border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[500px] bg-slate-900/10">
        <div className="bg-slate-900 p-6 rounded-full mb-8 text-slate-700 border border-slate-800 shadow-inner">{icon}</div>
        <h4 className="text-slate-400 fw-bold text-2xl mb-3">{message}</h4>
        <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">특종은 발로 뛴다고 만들어지지 않습니다. AI와 함께라면 이미 당신은 특종을 손에 쥐고 있습니다.</p>
    </div>
  </div>
);

export default Dashboard;
