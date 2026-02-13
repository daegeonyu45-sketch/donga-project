
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateTrotLyrics, speakTrot, decodeAudio } from '../services/gemini';
import { Music, Play, Pause, Save, Trash2, Headphones, Sparkles, Loader2, Volume2, Mic2, AlertCircle, RotateCcw, Download } from 'lucide-react';

interface SavedAudioNews {
  id: number;
  title: string;
  lyrics: string;
  timestamp: string;
}

interface AudioNewsProps {
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

const AudioNews: React.FC<AudioNewsProps> = ({ isMockMode, setIsMockMode }) => {
  const [inputText, setInputText] = useState(() => {
    const session = localStorage.getItem('donga_audio_session');
    return session ? JSON.parse(session).text : '';
  });
  const [lyrics, setLyrics] = useState<string | null>(() => {
    const session = localStorage.getItem('donga_audio_session');
    return session ? JSON.parse(session).savedLyrics : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedAudioNews[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ttsBufferRef = useRef<AudioBuffer | null>(null); 
  
  const playbackOffsetRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isManuallyStoppedRef = useRef<boolean>(false);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    const savedArchive = localStorage.getItem('donga_audio_archive');
    if (savedArchive) setSavedItems(JSON.parse(savedArchive));
    return () => {
      isManuallyStoppedRef.current = true;
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('donga_audio_session', JSON.stringify({
      text: inputText,
      savedLyrics: lyrics
    }));
  }, [inputText, lyrics]);

  const stopPlayback = () => {
    const ctx = audioContextRef.current;
    if (ttsSourceRef.current && ctx) {
      isManuallyStoppedRef.current = true;
      const elapsed = ctx.currentTime - startTimeRef.current;
      playbackOffsetRef.current += Math.max(0, elapsed);
      
      try { ttsSourceRef.current.stop(); } catch(e) {}
      ttsSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playTts = async (buffer: AudioBuffer, offset: number = 0) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    if (ttsSourceRef.current) {
      try { ttsSourceRef.current.stop(); } catch(e) {}
    }

    const startOffset = offset >= buffer.duration ? 0 : offset;
    playbackOffsetRef.current = startOffset;

    const ttsSource = ctx.createBufferSource();
    ttsSource.buffer = buffer;
    
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = 1.4; 
    
    ttsSource.connect(voiceGain);
    voiceGain.connect(ctx.destination);
    ttsSourceRef.current = ttsSource;
    
    isManuallyStoppedRef.current = false;
    
    ttsSource.onended = () => {
      if (!isManuallyStoppedRef.current) {
        playbackOffsetRef.current = 0;
        setIsPlaying(false);
      }
    };

    const playDelay = 0.1;
    startTimeRef.current = ctx.currentTime + playDelay;
    ttsSource.start(startTimeRef.current, startOffset);
  };

  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert("뉴스를 입력해주세요!");
      return;
    }

    setErrorMessage(null);
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    playbackOffsetRef.current = 0;
    stopPlayback();
    
    setIsLoading(true);
    ttsBufferRef.current = null;
    setLyrics(null);

    try {
      const gukakLyrics = await generateTrotLyrics(inputText, isMockMode);
      setLyrics(gukakLyrics);

      const audioDataBase64 = await speakTrot(gukakLyrics, isMockMode);
      
      if (isMockMode) {
        setIsLoading(false);
        setIsPlaying(true); 
        return;
      }

      if (!audioDataBase64) throw new Error("Audio generation failed");
      
      const buffer = await decodeAudio(audioDataBase64, ctx);
      ttsBufferRef.current = buffer; 
      
      setIsLoading(false);
      setIsPlaying(true);
      await playTts(buffer, 0);
    } catch (error: any) {
      console.error(error);
      stopPlayback();
      const msg = "국악 음성 제작 중 오류가 발생했습니다. 다시 시도해주세요.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      const ctx = initAudioContext();
      await ctx.resume();
      if (ttsBufferRef.current) {
        setIsPlaying(true);
        await playTts(ttsBufferRef.current, playbackOffsetRef.current);
      } else if (lyrics && !isMockMode) {
        handleConvert();
      } else if (!isMockMode) {
        alert("먼저 국악 뉴스를 생성해주세요!");
      }
    }
  };

  const resetPlayback = () => {
    playbackOffsetRef.current = 0;
    if (isPlaying) {
        stopPlayback();
        if (ttsBufferRef.current) {
            setIsPlaying(true);
            playTts(ttsBufferRef.current, 0);
        }
    }
  };

  // AudioBuffer를 WAV 파일로 변환하여 다운로드하는 기능
  const downloadAudio = () => {
    const buffer = ttsBufferRef.current;
    if (!buffer) return;

    const worker = () => {
      const length = buffer.length * buffer.numberOfChannels * 2 + 44;
      const view = new DataView(new ArrayBuffer(length));
      let offset = 0;

      const writeString = (s: string) => {
        for (let i = 0; i < s.length; i++) {
          view.setUint8(offset + i, s.charCodeAt(i));
        }
        offset += s.length;
      };

      writeString('RIFF');
      view.setUint32(offset, length - 8, true); offset += 4;
      writeString('WAVE');
      writeString('fmt ');
      view.setUint32(offset, 16, true); offset += 4;
      view.setUint16(offset, 1, true); offset += 2;
      view.setUint16(offset, buffer.numberOfChannels, true); offset += 2;
      view.setUint32(offset, buffer.sampleRate, true); offset += 4;
      view.setUint32(offset, buffer.sampleRate * 2 * buffer.numberOfChannels, true); offset += 4;
      view.setUint16(offset, buffer.numberOfChannels * 2, true); offset += 2;
      view.setUint16(offset, 16, true); offset += 2;
      writeString('data');
      view.setUint32(offset, length - offset - 4, true); offset += 4;

      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const channel = buffer.getChannelData(i);
        for (let j = 0; j < channel.length; j++) {
          const sample = Math.max(-1, Math.min(1, channel[j]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }
      return new Blob([view], { type: 'audio/wav' });
    };

    const blob = worker();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DongA_GukakNews_${Date.now()}.wav`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!lyrics) return;
    const newItem: SavedAudioNews = {
      id: Date.now(),
      title: inputText.split('\n')[0].slice(0, 20) || "신명나는 국악 뉴스",
      lyrics: lyrics,
      timestamp: new Date().toLocaleString()
    };
    const updated = [newItem, ...savedItems];
    setSavedItems(updated);
    localStorage.setItem('donga_audio_archive', JSON.stringify(updated));
    alert("국악 뉴스 보관함에 저장되었습니다.");
  };

  const deleteItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('donga_audio_archive', JSON.stringify(updated));
  };

  return (
    <div className="container-fluid py-2 text-white animate-fade-in">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="glass-card h-100 p-4 d-flex flex-column rounded-[32px] border-slate-800" style={{ minHeight: '80vh', background: '#0f172a' }}>
            <h5 className="text-white fw-bold mb-4 pb-3 border-bottom border-red-900/50 d-flex justify-content-between align-items-center">
              <span className="flex items-center gap-2"><Music size={20} className="text-red-500"/> 국악 보관함</span>
              <span className="badge bg-red-900/30 text-red-400 px-2">{savedItems.length}</span>
            </h5>
            <div className="overflow-auto custom-scrollbar flex-grow-1 pr-2">
              {savedItems.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <Headphones size={48} className="mx-auto mb-3" />
                  <p className="small">제작된 국악 뉴스가 없습니다.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => { 
                        setLyrics(item.lyrics); 
                        setInputText(item.title); 
                        playbackOffsetRef.current = 0; 
                        stopPlayback();
                      }}
                      className={`p-4 rounded-2xl transition-all border cursor-pointer position-relative group ${lyrics === item.lyrics ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800'}`}
                    >
                      <h6 className="text-white text-truncate mb-2 fw-bold" style={{ fontSize: '0.9rem' }}>{item.title}</h6>
                      <p className="text-slate-500 m-0" style={{ fontSize: '0.7rem' }}>{item.timestamp}</p>
                      <button 
                        onClick={(e) => deleteItem(e, item.id)}
                        className="btn btn-link text-red-500 p-0 position-absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-all border-0 shadow-none"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="col-lg-9">
          <div className="text-center mb-6">
            <h1 className="display-5 fw-black text-white mb-2 tracking-tighter">
              <span className="text-gradient-gukak">AI 국악 뉴스룸</span>
            </h1>
            <p className="text-slate-400">우리 가락의 울림으로 전하는 오늘의 핵심 뉴스</p>
          </div>

          <div className="row g-4">
            <div className="col-xl-6">
              <div className="glass-card p-5 h-100 d-flex flex-column rounded-[40px] border-slate-800 shadow-2xl" style={{ background: '#0f172a' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <label className="text-slate-400 fw-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <Mic2 size={16} className="text-red-500" /> 뉴스 기사 본문
                  </label>
                  <div className="flex gap-1">
                    <span className="w-1 h-4 bg-red-600 animate-[bounce_1.2s_infinite]"></span>
                    <span className="w-1 h-6 bg-red-500 animate-[bounce_1.5s_infinite]"></span>
                    <span className="w-1 h-3 bg-red-400 animate-[bounce_0.9s_infinite]"></span>
                  </div>
                </div>
                <textarea
                  className="form-control bg-slate-950 text-white border-slate-800 mb-5 flex-grow-1 p-4 rounded-3xl shadow-inner custom-scrollbar"
                  style={{ resize: 'none', minHeight: '400px', fontSize: '1rem', lineHeight: '1.7', border: '1px solid rgba(255,255,255,0.05)' }}
                  placeholder="기사를 입력하면 AI가 신명나는 국악(판소리) 스타일 가사와 음성으로 변환해 드립니다."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                ></textarea>
                
                <div className="d-flex gap-3">
                  <button 
                    className="btn flex-grow-1 py-4 rounded-2xl fw-black fs-5 shadow-2xl border-0 transition-transform active:scale-95 flex items-center justify-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)', color: '#fff' }}
                    onClick={handleConvert}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="animate-spin" /> <span>국악 가사 짓는 중...</span></>
                    ) : (
                      <><Play fill="white" /> 🥁 국악 뉴스 생성</>
                    )}
                  </button>
                  {lyrics && !isLoading && (
                    <button className="btn btn-outline-slate-700 px-4 rounded-2xl border-slate-800 hover:bg-slate-800 transition-all shadow-lg text-red-500" title="저장하기" onClick={handleSave}>
                      <Save size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              <div className="glass-card p-5 h-100 d-flex flex-column align-items-center justify-content-center text-center rounded-[40px] border-slate-800 shadow-2xl" style={{ background: '#020617' }}>
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle size={20} />
                    {errorMessage}
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-20 animate-fade-in w-100">
                    <div className="mb-10">
                      <div className="flex justify-center items-end gap-2 mb-8 h-20">
                        {[...Array(8)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-3 bg-red-600 rounded-full animate-[bounce_1s_infinite]" 
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              height: `${30 + Math.random() * 70}%`
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="bg-slate-900/50 w-48 h-48 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-900/30 border-t-red-600 animate-spin shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                        <Sparkles size={60} className="text-red-500 animate-pulse" />
                      </div>
                    </div>
                    <h4 className="fw-black text-red-500 display-6 tracking-tighter mb-3">소리판 준비 중...</h4>
                    <p className="text-slate-500 fw-bold">AI 명창이 뉴스 사설을 구성지게 읊고 있소!</p>
                  </div>
                ) : !lyrics ? (
                  <div className="py-20 opacity-20">
                    <div className="bg-slate-900 w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/30 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
                      <Music size={80} className="text-red-500" />
                    </div>
                    <h4 className="fw-black text-slate-500">대기 중</h4>
                    <p className="small">버튼을 누르면 신명나는 소리가 시작됩니다!</p>
                  </div>
                ) : (
                  <div className="w-100 animate-fade-in">
                    <div className="mb-6 position-relative d-inline-block">
                        <div 
                            className={`rounded-full border-[15px] border-slate-900 mx-auto d-flex align-items-center justify-content-center shadow-3xl ${isPlaying ? 'spin-slow' : ''}`}
                            style={{ 
                                width: '300px', 
                                height: '300px', 
                                background: 'radial-gradient(circle, #7f1d1d 0%, #0f172a 40%, #020617 70%)',
                                border: isPlaying ? '15px solid #ef444444' : '15px solid #1e293b',
                                boxShadow: isPlaying ? '0 0 60px rgba(239, 68, 68, 0.2)' : 'none'
                            }}
                        >
                          <div className="rounded-full bg-red-700 flex items-center justify-center shadow-2xl" style={{ width: '90px', height: '90px', border: '6px solid #000' }}>
                             <Volume2 size={40} className="text-white" />
                          </div>
                        </div>
                        <div className="position-absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10" onClick={togglePlay}>
                           {isPlaying ? (
                               <Pause size={100} className="text-white fill-white opacity-90 hover:scale-110 transition-all drop-shadow-2xl" />
                           ) : (
                               <Play size={100} className="text-white fill-white opacity-90 hover:scale-110 transition-all translate-x-1 drop-shadow-2xl" />
                           )}
                        </div>
                    </div>

                    <div className="mb-4 d-flex justify-content-center gap-2">
                        {playbackOffsetRef.current > 0 && !isPlaying && (
                            <div className="badge bg-red-600/20 text-red-400 px-3 py-2 border border-red-500/30 rounded-full flex items-center gap-2 animate-pulse">
                                {Math.floor(playbackOffsetRef.current)}초 지점 중단
                            </div>
                        )}
                        {ttsBufferRef.current && (
                           <button onClick={downloadAudio} className="badge bg-blue-600/20 text-blue-400 px-3 py-2 border border-blue-500/30 rounded-full flex items-center gap-2 hover:bg-blue-600/40 transition-all border-0 cursor-pointer">
                              <Download size={14} /> 소리 내려받기
                           </button>
                        )}
                    </div>

                    <div className="bg-slate-900/60 rounded-3xl p-5 mb-6 text-start border border-red-900/20 custom-scrollbar shadow-inner" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                       <pre className="text-white m-0" style={{ fontFamily: 'Pretendard', whiteSpace: 'pre-wrap', lineHeight: '2.0', fontSize: '1.1rem', fontWeight: '600', color: '#fca5a5' }}>
                          {lyrics}
                        </pre>
                    </div>

                    <div className="d-flex gap-3">
                        <button 
                            className={`btn flex-grow-1 py-4 rounded-2xl fw-black fs-5 shadow-xl flex items-center justify-center gap-3 transition-all ${isPlaying ? 'btn-danger' : 'btn-dark border-red-900'}`} 
                            onClick={togglePlay}
                        >
                            {isPlaying ? <><Pause /> 일시 정지</> : (playbackOffsetRef.current > 0 ? <><Play /> 이어 듣기</> : <><Play /> 처음부터 재생</>)}
                        </button>
                        {playbackOffsetRef.current > 0 && (
                            <button className="btn btn-outline-slate-700 px-4 rounded-2xl border-slate-800 hover:bg-slate-800 transition-all text-slate-400" title="처음부터 다시" onClick={resetPlayback}>
                                <RotateCcw size={24} />
                            </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .text-gradient-gukak {
            background: linear-gradient(to right, #fca5a5, #f87171, #ef4444);
            background-size: 200% auto;
            animation: shine 4s linear infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-family: serif;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .shadow-3xl { box-shadow: 0 45px 80px -20px rgba(0, 0, 0, 0.8); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #7f1d1d; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AudioNews;
