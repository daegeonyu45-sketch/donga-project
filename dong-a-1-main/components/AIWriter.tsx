
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateFactBasedArticle, generateImage, generateCoverageSuggestions } from '../services/gemini';
import { Sparkles, Save, Loader2, FileText, Cpu, RefreshCw, AlertCircle, ArrowRight, Link, Trash2, Quote, Maximize2, X, Zap, ShieldAlert, CheckCircle, Edit3, Image as ImageIcon, Copy } from 'lucide-react';

interface AIWriterProps {
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

interface Suggestion {
  id: string;
  title: string;
  category: string;
  angle: string;
  urgency: string;
}

const AIWriter: React.FC<AIWriterProps> = ({ isMockMode, setIsMockMode }) => {
  const [topic, setTopic] = useState(() => localStorage.getItem('donga_writer_topic') || "");
  const [category, setCategory] = useState(() => localStorage.getItem('donga_writer_category') || "social");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const [articleData, setArticleData] = useState<any | null>(() => {
    const saved = localStorage.getItem('donga_writer_article');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [imageResult, setImageResult] = useState<string | null>(() => localStorage.getItem('donga_writer_image'));
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState(""); 
  const [errorMsg, setErrorMsg] = useState("");
  const [showQuotaPrompt, setShowQuotaPrompt] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState("");

  const topicInputRef = useRef<HTMLInputElement>(null);

  const checkIfSaved = useCallback(() => {
    if (!articleData || !articleData.id) {
      setIsSaved(false);
      return;
    }
    try {
      const savedRaw = localStorage.getItem('dashboard_db');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const isAlready = saved.some((a: any) => a.id === articleData.id);
      setIsSaved(isAlready);
    } catch (e) {
      setIsSaved(false);
    }
  }, [articleData]);

  useEffect(() => {
    checkIfSaved();
  }, [checkIfSaved, articleData]);

  const cleanContent = (text: string) => {
    if (!text) return "";
    // 특수문자 마크다운 제거
    let cleaned = text.replace(/[#*]{2,}/g, "").trim();
    cleaned = cleaned.replace(/^#+\s+/gm, "");
    if (!cleaned.includes("<p>")) {
      cleaned = cleaned.split('\n\n').map(p => `<p style="margin-bottom: 1.5rem;">${p}</p>`).join('');
    }
    return cleaned;
  };

  useEffect(() => {
    try {
      localStorage.setItem('donga_writer_topic', topic);
      localStorage.setItem('donga_writer_category', category);
      if (articleData) {
        localStorage.setItem('donga_writer_article', JSON.stringify(articleData));
      }
      if (imageResult) {
        localStorage.setItem('donga_writer_image', imageResult);
      }
    } catch (e) {
      console.warn("Storage quota limit");
    }
  }, [topic, category, articleData, imageResult]);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const data = await generateCoverageSuggestions(isMockMode);
      setSuggestions(data || []);
    } catch (e: any) {
      console.error("Suggestion fetch error", e);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [isMockMode]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const safeSaveToDashboard = (newArticle: any) => {
    try {
      const savedData = localStorage.getItem('dashboard_db');
      let currentList = savedData ? JSON.parse(savedData) : [];
      const existingIdx = currentList.findIndex((a: any) => a.id === newArticle.id);
      if (existingIdx !== -1) {
        currentList[existingIdx] = newArticle;
      } else {
        currentList = [newArticle, ...currentList];
      }
      if (currentList.length > 20) currentList = currentList.slice(0, 20);
      localStorage.setItem('dashboard_db', JSON.stringify(currentList));
      setIsSaved(true);
      return true;
    } catch (err) {
      console.error("Save Error:", err);
      setErrorMsg("저장 공간이 부족합니다.");
      return false;
    }
  };

  const handleManualSave = () => {
    if (!articleData) return;
    const success = safeSaveToDashboard({ ...articleData, image: imageResult });
    if (success) {
      alert("✅ 대시보드에 기사가 성공적으로 저장되었습니다.");
    }
  };

  const handleFullCreation = async () => {
    if (!topic.trim()) {
        alert("기사 주제를 입력해주세요!");
        return;
    }
    setLoading(true);
    setErrorMsg("");
    setShowQuotaPrompt(false);
    setIsSaved(false);
    setIsEditMode(false);
    try {
      setStatusText("데이터 수집 및 팩트체크 중... 🔍");
      const result = await generateFactBasedArticle(topic, category, isMockMode);
      
      const newArticleId = `art_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const refinedContent = cleanContent(result.content);
      
      const newArticleData = {
        id: newArticleId,
        title: result.title || topic,
        summary: result.summary || "",
        content: refinedContent,
        category: result.category || category,
        factCheck: result.factCheck || "AI 정밀 검증 완료",
        sources: result.sources || [],
        searchSources: result.searchSources,
        date: new Date().toLocaleString()
      };
      
      setArticleData(newArticleData);
      
      setStatusText("보도 이미지 생성 중... 📸");
      const imgUrl = await generateImage(result.imageKeyword || topic, isMockMode);
      setImageResult(imgUrl);
      
      // 자동 저장
      safeSaveToDashboard({ ...newArticleData, image: imgUrl });
    } catch (e: any) {
      console.error("기사 생성 오류:", e);
      if (e.message === "QUOTA_EXCEEDED") {
        setErrorMsg("API 무료 사용량이 모두 소진되었습니다.");
        setShowQuotaPrompt(true);
      } else {
        setErrorMsg("생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const switchToDemo = () => {
    setIsMockMode(true);
    setErrorMsg("");
    setShowQuotaPrompt(false);
    setTimeout(() => handleFullCreation(), 100);
  };

  const startEditing = () => {
    setEditTitle(articleData.title);
    setEditContent(articleData.content.replace(/<[^>]*>/g, "\n\n").trim());
    setEditImage(imageResult || "");
    setIsEditMode(true);
  };

  const saveEditing = () => {
    const updatedContent = editContent.split('\n\n').filter(p => p.trim()).map(p => `<p style="margin-bottom: 1.5rem;">${p.trim()}</p>`).join('');
    const updatedData = { ...articleData, title: editTitle, content: updatedContent };
    setArticleData(updatedData);
    setImageResult(editImage);
    setIsEditMode(false);
    safeSaveToDashboard({ ...updatedData, image: editImage });
    alert("✅ 기사가 성공적으로 수정되었습니다.");
  };

  const handleCopy = () => {
    if (!articleData) return;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = articleData.content;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";
    const fullText = `${articleData.title}\n\n${plainText}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert("✅ 기사 내용이 클립보드에 복사되었습니다.");
    });
  };

  const handleReset = () => {
    if (window.confirm("작성 중인 내용을 초기화하시겠습니까?")) {
      setTopic("");
      setArticleData(null);
      setImageResult(null);
      setIsSaved(false);
      setIsEditMode(false);
      setErrorMsg("");
      setShowQuotaPrompt(false);
    }
  };

  const handleDeleteFromDashboard = () => {
    if (!articleData || !articleData.id) return;
    if (!window.confirm("이 기사를 대시보드에서 삭제하시겠습니까?")) return;
    try {
      const savedRaw = localStorage.getItem('dashboard_db');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const updated = saved.filter((a: any) => a.id !== articleData.id);
      localStorage.setItem('dashboard_db', JSON.stringify(updated));
      setIsSaved(false);
      alert("🗑️ 대시보드에서 삭제되었습니다.");
    } catch (e) {}
  };

  const handleQuickStart = (item: Suggestion) => {
    // 주제(Topic) 설정
    setTopic(item.title);
    
    // 카테고리(Category) 매핑 로직 강화 (한글/영문 모두 대응)
    const cat = item.category.toLowerCase();
    
    if (cat.includes('it') || cat.includes('tech') || cat.includes('기술') || cat.includes('과학')) {
      setCategory('tech');
    } else if (cat.includes('econ') || cat.includes('경제')) {
      setCategory('economy');
    } else if (cat.includes('polit') || cat.includes('정치')) {
      setCategory('politics');
    } else if (cat.includes('enter') || cat.includes('ent') || cat.includes('연예')) {
      setCategory('entertainment');
    } else if (cat.includes('sport') || cat.includes('스포츠')) {
      setCategory('sports');
    } else {
      setCategory('social');
    }

    // 시각적 피드백 및 스크롤 이동
    window.scrollTo({ top: 450, behavior: 'smooth' });
    
    // 입력창에 포커스
    if (topicInputRef.current) {
      setTimeout(() => {
        topicInputRef.current?.focus();
      }, 600);
    }
  };

  return (
    <div className="h-100 p-2 text-white animate-fade-in">
      {isZoomed && imageResult && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in cursor-zoom-out" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white border-0 bg-transparent"><X size={40} /></button>
          <img src={imageResult} alt="Expanded" className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scale-up" />
        </div>
      )}

      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-blue-600/30 p-2 rounded-xl border border-blue-500/30"><RefreshCw className={`text-blue-400 ${loadingSuggestions ? 'animate-spin' : ''}`} size={20} /></div>
            <div>
              <h4 className="fw-black m-0 tracking-tighter flex items-center gap-2">실시간 취재 브리핑 <span className="badge bg-red-600 px-2 py-0.5 animate-pulse text-[10px] rounded">HOT</span></h4>
              <p className="text-[11px] text-slate-500 m-0">온라인 트렌드를 분석한 추천 아이템입니다.</p>
            </div>
          </div>
          <button onClick={handleReset} className="btn btn-outline-slate-700 btn-sm text-[10px] fw-bold d-flex align-items-center gap-2 px-3 py-2 rounded-xl"><Trash2 size={14} /> 초기화</button>
        </div>
        <div className="row g-3">
          {loadingSuggestions ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="col-md-3"><div className="glass-card p-4 rounded-2xl border-slate-800 animate-pulse h-[140px]"></div></div>) : suggestions.map((item) => (
            <div key={item.id} className="col-md-3">
              <div className="glass-card p-4 rounded-2xl border-slate-800 h-100 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xl" onClick={() => handleQuickStart(item)}>
                <div>
                  <div className="d-flex justify-content-between mb-3"><span className="badge bg-red-600/20 text-red-500 border border-red-500/30 text-[9px] px-2 py-1 font-black uppercase">{item.urgency}</span><span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{item.category}</span></div>
                  <h6 className="text-white fw-bold text-sm mb-2 group-hover:text-blue-400 leading-snug line-clamp-2">{item.title}</h6>
                </div>
                <div className="pt-3 border-t border-slate-800/50 mt-3 flex justify-between items-center"><span className="text-[10px] text-slate-500 italic">"{item.angle}"</span><ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 mb-5 rounded-3xl border-0 shadow-2xl relative overflow-hidden" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
        <h2 className="fw-black mb-4 tracking-tighter d-flex align-items-center gap-3 text-white"><div className="bg-primary/20 p-2 rounded-xl"><Sparkles className="text-primary" size={24} /></div>AI 기사 생성기</h2>
        <div className="row g-3">
          <div className="col-md-3">
            <select className="form-select !bg-slate-950 border-slate-800 rounded-xl py-3 text-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="social">사회</option>
              <option value="politics">정치</option>
              <option value="economy">경제</option>
              <option value="tech">IT/과학</option>
              <option value="entertainment">연예</option>
              <option value="sports">스포츠</option>
            </select>
          </div>
          <div className="col-md-7"><input ref={topicInputRef} className="form-control fs-5 !bg-slate-950 border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="기사 주제를 입력하세요..." value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFullCreation()} /></div>
          <div className="col-md-2 pt-1"><button className="btn btn-primary w-100 py-3 rounded-xl fw-black shadow-lg flex items-center justify-center gap-2" onClick={handleFullCreation} disabled={loading}>{loading ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={18} />}기사 생성</button></div>
        </div>
        {(loading || errorMsg) && (
            <div className={`mt-5 p-5 rounded-3xl border shadow-2xl animate-fade-in ${errorMsg ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="flex flex-col items-center gap-4">
                  {errorMsg ? <AlertCircle size={40} className="text-red-500" /> : <Loader2 className="animate-spin text-blue-400" size={40} />}
                  <div className="text-center">
                    <h5 className={`font-black mb-1 ${errorMsg ? 'text-red-400' : 'text-blue-300'}`}>{errorMsg || "진행 중"}</h5>
                    <p className="text-slate-500 text-sm m-0">{errorMsg ? "현재 서비스 이용이 원활하지 않습니다." : statusText}</p>
                  </div>
                  {showQuotaPrompt && (
                    <div className="mt-4 p-4 bg-slate-900/80 rounded-2xl border border-red-500/20 w-full max-w-md text-center">
                      <p className="text-xs text-slate-400 mb-4">제한적인 할당량으로 인해 실시간 AI 기능이 중단되었습니다.<br/>기사 작성 기능을 체험하시려면 <b>데모 모드</b>로 전환하세요.</p>
                      <button onClick={switchToDemo} className="btn btn-amber-500 w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white border-0 shadow-lg">
                        <Zap size={18} /> 데모 모드로 체험하기
                      </button>
                    </div>
                  )}
                </div>
            </div>
        )}
      </div>

      {articleData && (
        <div className="row g-4 animate-fade-in pb-5">
            <div className="col-lg-3">
              <div className="glass-card p-4 rounded-4 border-slate-800 h-100 shadow-xl" style={{ background: '#0f172a' }}>
                <h6 className="text-blue-400 fw-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest"><Link size={16} /> 취재 근거</h6>
                <div className="d-flex flex-column gap-3">
                  {articleData.searchSources?.length > 0 ? articleData.searchSources.map((source: any, i: number) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="glass-card p-3 rounded-xl border-slate-800 text-slate-400 text-xs hover:text-blue-400 no-underline transition-all flex flex-col gap-2 group hover:bg-slate-800/50">
                      <div className="text-white font-bold line-clamp-2 group-hover:text-blue-400">{source.title}</div>
                      <div className="text-[9px] opacity-40 truncate flex items-center gap-1"><Link size={10} /> {source.uri}</div>
                    </a>
                  )) : (
                    <div className="text-[10px] text-slate-600 italic">팩트체크용 검색 결과가 표시됩니다.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
                <div className="glass-card p-5 rounded-4 h-100 border-0 shadow-2xl overflow-hidden" style={{ background: '#0f172a' }}>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      {isEditMode ? (
                        <input 
                          className="form-control bg-slate-900 border-slate-700 text-white fw-black display-6 py-2 px-3 rounded-xl"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      ) : (
                        <h1 className="fw-black text-white display-5 tracking-tighter m-0">{articleData.title}</h1>
                      )}
                      
                      <div className="flex gap-2 shrink-0">
                         {isEditMode ? (
                            <button className="btn btn-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2" onClick={saveEditing}>
                              <CheckCircle size={18} /> 저장
                            </button>
                         ) : (
                            <div className="flex gap-2">
                               <button 
                                  className={`btn px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${isSaved ? 'btn-success bg-green-600 border-green-500' : 'btn-primary shadow-lg'}`} 
                                  onClick={handleManualSave}
                                  disabled={isSaved}
                               >
                                  {isSaved ? <CheckCircle size={18} /> : <Save size={18} />} {isSaved ? "저장 완료" : "기사 저장"}
                               </button>
                               <button className="btn btn-outline-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-slate-400 hover:text-white border-slate-700" onClick={startEditing}>
                                  <Edit3 size={18} /> 수정
                               </button>
                               <button className="btn btn-outline-blue-500 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-blue-400 hover:text-white border-blue-500/30 bg-blue-500/5" onClick={handleCopy}>
                                  <Copy size={18} /> 복사
                               </button>
                               <button onClick={handleDeleteFromDashboard} className="btn btn-outline-danger px-4 py-2 rounded-xl font-bold flex items-center gap-2 border-slate-700">
                                  <Trash2 size={18} />
                               </button>
                            </div>
                         )}
                      </div>
                    </div>
                    
                    {isEditMode ? (
                      <textarea 
                        className="form-control bg-slate-900 border-slate-700 text-white p-4 rounded-2xl custom-scrollbar"
                        style={{ minHeight: '500px', fontSize: '1.1rem', lineHeight: '1.8' }}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="본문 내용을 수정하세요"
                      />
                    ) : (
                      <div 
                        className="text-slate-200 article-body" 
                        style={{ fontSize: '1.2rem', lineHeight: '2.1', letterSpacing: '-0.3px' }} 
                        dangerouslySetInnerHTML={{ __html: articleData.content }} 
                      />
                    )}
                </div>
            </div>
            
            <div className="col-lg-3">
                <div className="d-flex flex-column gap-4 h-100">
                    <div className="glass-card p-4 rounded-4 border-0 shadow-xl" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                        <h6 className="text-blue-400 font-black mb-3 flex items-center gap-2 text-xs uppercase tracking-widest"><Quote size={14} /> 요약</h6>
                        <div className="text-slate-300 leading-relaxed text-sm font-medium bg-slate-950/40 p-3 rounded-xl border border-slate-800">{articleData.summary}</div>
                    </div>
                    
                    <div className="glass-card p-4 rounded-4 border-slate-800 shadow-lg overflow-hidden group/img" style={{ background: '#1e293b' }}>
                        <div className="position-relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 cursor-zoom-in" style={{ aspectRatio: '16/9' }} onClick={() => !isEditMode && setIsZoomed(true)}>
                            {isEditMode ? (
                                <div className="flex flex-col gap-2 p-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase">이미지 URL</label>
                                    <input 
                                        className="form-control form-control-sm !bg-slate-800 border-slate-700 text-white text-[10px]"
                                        value={editImage}
                                        onChange={(e) => setEditImage(e.target.value)}
                                    />
                                    {editImage && <img src={editImage} className="w-full rounded-lg mt-2" />}
                                </div>
                            ) : imageResult ? (
                              <img src={imageResult} alt="News" className="w-full h-full object-cover group-hover/img:scale-105 transition-all duration-500"/>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center opacity-20">
                                <Loader2 className="animate-spin mb-2" size={24}/>
                                <p className="text-[9px] font-bold">이미지 생성 중</p>
                              </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="glass-card p-4 rounded-4 border-0 shadow-xl bg-green-500/5 border-green-500/10">
                        <h6 className="text-green-400 font-black mb-2 flex items-center gap-2 text-xs uppercase tracking-widest"><ShieldAlert size={14} /> 팩트체크 상태</h6>
                        <p className="text-slate-400 text-xs m-0 leading-relaxed">{articleData.factCheck}</p>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        .article-body p { margin-bottom: 2rem !important; }
        .article-body h3 { margin-top: 2.5rem !important; margin-bottom: 1rem !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      `}</style>
    </div>
  );
};

export default AIWriter;
