
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Send, MessageCircle, Heart, ThumbsUp, Angry, Frown, Save, Trash2, Sparkles, X } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
}

interface SavedHeadline {
  id: number;
  name: string;
  headline: string;
  image: string;
  reactions: {
    like: number;
    heart: number;
    angry: number;
    sad: number;
  };
  comments: Comment[];
  date: string;
}

interface Props {
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

const HeadlineMaker: React.FC<Props> = ({ isMockMode, setIsMockMode }) => {
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [savedHeadlines, setSavedHeadlines] = useState<SavedHeadline[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('viewer_headlines');
    if (saved) setSavedHeadlines(JSON.parse(saved));
  }, []);

  const saveToLocal = (data: SavedHeadline[]) => {
    setSavedHeadlines(data);
    localStorage.setItem('viewer_headlines', JSON.stringify(data));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const publishHeadline = () => {
    if (!name.trim() || !headline.trim()) {
      alert("이름과 속보 내용을 입력해주세요!");
      return;
    }

    const newEntry: SavedHeadline = {
      id: Date.now(),
      name,
      headline,
      image: uploadedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      reactions: { like: 0, heart: 0, angry: 0, sad: 0 },
      comments: [],
      date: new Date().toLocaleString()
    };

    const updated = [newEntry, ...savedHeadlines];
    saveToLocal(updated);
    
    // Reset
    setName('');
    setHeadline('');
    setUploadedImage(null);
    alert("🚀 나만의 속보가 발행되었습니다!");
  };

  const handleReaction = (id: number, type: keyof SavedHeadline['reactions']) => {
    const updated = savedHeadlines.map(h => {
      if (h.id === id) return { ...h, reactions: { ...h.reactions, [type]: h.reactions[type] + 1 } };
      return h;
    });
    saveToLocal(updated);
  };

  const deleteHeadline = (id: number) => {
    if (!window.confirm("이 속보를 영구적으로 삭제하시겠습니까?")) return;
    const updated = savedHeadlines.filter(h => h.id !== id);
    saveToLocal(updated);
  };

  const addComment = (id: number) => {
    const text = commentInputs[id];
    if (!text?.trim()) return;
    const updated = savedHeadlines.map(h => {
      if (h.id === id) {
        return { ...h, comments: [...h.comments, { id: Date.now(), user: "방구석 네티즌", text, date: "방금 전" }] };
      }
      return h;
    });
    saveToLocal(updated);
    setCommentInputs({ ...commentInputs, [id]: '' });
  };

  return (
    <div className="text-white pb-5 animate-fade-in">
      <div className="row g-5">
        <div className="col-lg-5">
          <div className="glass-card p-4 sticky-top border-0 shadow-2xl" style={{ top: '20px', background: '#0f172a' }}>
            <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Sparkles className="text-danger" /> 속보 합성 스튜디오
            </h3>
            
            <div className="mb-3">
              <label className="text-slate-400 text-xs font-bold mb-1 block uppercase">주인공</label>
              <input type="text" placeholder="이름" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="text-slate-400 text-xs font-bold mb-1 block uppercase">속보 헤드라인</label>
              <input type="text" placeholder="속보 제목" className="form-control" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="text-slate-400 text-xs font-bold mb-1 block uppercase">배경 사진 업로드</label>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline-slate-700 w-100 py-3 border-dashed border-2 text-slate-300">
                <Camera size={20} className="me-2"/> 사진 선택하기
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="preview-container mb-4">
              <div className="position-relative rounded-3 overflow-hidden" style={{ height: '200px', background: '#000' }}>
                <img src={uploadedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'} className="w-100 h-100 object-cover opacity-60" />
                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to right, #cc0000 0%, #7f0000 100%)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-white text-danger fw-black px-1 py-1">속보</span>
                        <span className="text-white fw-bold truncate">{name ? `${name} 씨, ` : ''}{headline || '내용을 입력하세요'}</span>
                    </div>
                </div>
              </div>
            </div>

            <button className="btn btn-danger w-100 py-3 fw-bold shadow-lg" onClick={publishHeadline}>속보 발행</button>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold m-0">📡 시청자 발행 타임라인</h3>
            {savedHeadlines.length > 0 && (
              <button onClick={() => { if(window.confirm("모든 속보를 삭제하시겠습니까?")) saveToLocal([]); }} className="btn btn-outline-slate-700 btn-sm rounded-xl px-3 border-0 hover:text-red-500 font-bold">
                전체 삭제
              </button>
            )}
          </div>
          
          <div className="d-flex flex-column gap-5">
            {savedHeadlines.length === 0 ? (
              <div className="glass-card p-10 rounded-4 text-center border-slate-800 opacity-40">
                <Sparkles size={48} className="mx-auto mb-3" />
                <p className="fw-bold">아직 발행된 나만의 속보가 없습니다.</p>
              </div>
            ) : (
              savedHeadlines.map(h => (
                <div key={h.id} className="glass-card rounded-4 overflow-hidden border-0 shadow-xl group" style={{ background: '#1e293b' }}>
                  <div className="position-relative" style={{ height: '300px' }}>
                    <img src={h.image} className="w-100 h-100 object-cover" />
                    <div className="position-absolute top-4 right-4 z-10">
                      <button 
                        onClick={() => deleteHeadline(h.id)} 
                        className="w-10 h-10 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all border-0 shadow-xl opacity-0 group-hover:opacity-100"
                        title="속보 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(127,0,0,1) 0%, rgba(204,0,0,0.8) 40%, rgba(204,0,0,0) 100%)' }}>
                        <h2 className="text-white fw-bold m-0 fs-3">{h.name} 씨, {h.headline}</h2>
                    </div>
                  </div>

                  <div className="p-3 px-4 d-flex align-items-center justify-content-between bg-slate-900/40">
                    <div className="d-flex gap-4">
                      <button onClick={() => handleReaction(h.id, 'like')} className="reaction-btn text-slate-400 hover:text-blue-400 border-0 bg-transparent"><ThumbsUp size={18}/> {h.reactions.like}</button>
                      <button onClick={() => handleReaction(h.id, 'heart')} className="reaction-btn text-slate-400 hover:text-pink-400 border-0 bg-transparent"><Heart size={18}/> {h.reactions.heart}</button>
                      <button onClick={() => handleReaction(h.id, 'angry')} className="reaction-btn text-slate-400 hover:text-red-400 border-0 bg-transparent"><Angry size={18}/> {h.reactions.angry}</button>
                    </div>
                    <div className="text-slate-500 text-xs font-bold flex items-center gap-1"><MessageCircle size={14}/> 댓글 {h.comments.length}</div>
                  </div>

                  <div className="bg-slate-900/30 p-4">
                    <div className="space-y-2 mb-3">
                      {h.comments.map(c => (
                        <div key={c.id} className="d-flex gap-2 animate-fade-in"><div className="text-blue-400 text-xs font-bold">{c.user}</div><div className="text-slate-300 text-xs">{c.text}</div></div>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      <input type="text" className="form-control form-control-sm !bg-slate-800 border-slate-700 text-white" placeholder="시청자 의견 달기..." value={commentInputs[h.id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [h.id]: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && addComment(h.id)} />
                      <button onClick={() => addComment(h.id)} className="btn btn-primary btn-sm border-0 px-3">게시</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style>{`
        .reaction-btn { background: none; border: none; padding: 0; display: flex; align-items: center; gap: 4px; transition: 0.2s; }
        .hidden { display: none; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </div>
  );
};

export default HeadlineMaker;
