
import React, { useState } from 'react';
import NetizenSimulator from './NetizenSimulator';
import HeadlineMaker from './HeadlineMaker';
import RealtimeNews from './RealtimeNews';
import AudioNews from './AudioNews';

interface Props {
  onExit: () => void;
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

const ViewerLayout: React.FC<Props> = ({ onExit, isMockMode, setIsMockMode }) => {
  const [activeViewerTab, setActiveViewerTab] = useState('realtime');
  const [isHorrorMode, setIsHorrorMode] = useState(false);

  const viewerMenuStyle = (tab: string) => ({ 
    padding: '10px 20px', 
    cursor: 'pointer', 
    background: 'transparent',
    border: 'none',
    borderBottom: activeViewerTab === tab ? '3px solid #E50914' : '3px solid transparent',
    color: activeViewerTab === tab ? 'white' : '#cbd5e1',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'all 0.3s'
  });

  return (
    <div style={{ 
        backgroundColor: isHorrorMode ? '#0f0000' : '#020617',
        minHeight: '100vh', 
        color: 'white', 
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 1s ease'
    }}>
      <style>{`
        @keyframes pulse-red { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        .horror-title { text-align:center; color:#ff4d4d; margin-bottom:30px; text-shadow:0 0 10px #ff0000; animation: pulse-red 2s infinite; font-family: serif; }
      `}</style>
      
      <header style={{ 
          height: '80px', 
          padding: '0 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid #1e293b'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'40px'}}>
            <h2 style={{ color: isHorrorMode ? '#ff0000' : '#E50914', fontWeight: '900', margin: 0, fontSize: '1.8rem', letterSpacing: '-1px' }}>
                {isHorrorMode ? '👻 심야 뉴스' : '🍿 방구석 1열'}
            </h2>
            
            <nav style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setActiveViewerTab('realtime')} style={viewerMenuStyle('realtime') as any}>📡 실시간 기사</button>
                <button onClick={() => setActiveViewerTab('audio')} style={viewerMenuStyle('audio') as any}>🥁 국악 변환</button>
                <button onClick={() => setActiveViewerTab('netizen')} style={viewerMenuStyle('netizen') as any}>💬 댓글 전쟁</button>
                <button onClick={() => setActiveViewerTab('headline')} style={viewerMenuStyle('headline') as any}>📸 속보 합성</button>
            </nav>
        </div>

        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
             <button 
                onClick={() => setIsHorrorMode(!isHorrorMode)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                title={isHorrorMode ? "불 켜기" : "불 끄기"}
            >
                {isHorrorMode ? '🔦' : '🕯️'}
            </button>
            <button onClick={onExit} style={{ background: 'transparent', border: '1px solid #475569', color: 'white', padding: '8px 25px', borderRadius: '30px', fontWeight:'bold', fontSize: '14px' }}>나가기</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
        {isHorrorMode && <h1 className="horror-title fs-2">오늘 밤... 기사 하나 읽어드릴까요?</h1>}

        <div style={{ height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            {activeViewerTab === 'realtime' && <RealtimeNews />}
            {activeViewerTab === 'audio' && <AudioNews isMockMode={isMockMode} setIsMockMode={setIsMockMode} />}
            {activeViewerTab === 'netizen' && <NetizenSimulator isMockMode={isMockMode} setIsMockMode={setIsMockMode} />}
            {activeViewerTab === 'headline' && <HeadlineMaker isMockMode={isMockMode} setIsMockMode={setIsMockMode} />}
        </div>
      </main>
    </div>
  );
};

export default ViewerLayout;
