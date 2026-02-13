
import React from 'react';

interface Props {
  onSelectMode: (mode: 'reporter' | 'viewer') => void;
}

const NetflixIntro: React.FC<Props> = ({ onSelectMode }) => {
  return (
    <div className="intro-container">
      <style>{`
        .intro-container { 
          background: radial-gradient(circle at 50% 50%, #1a0000, #000); 
          height: 100vh; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          perspective: 1000px; 
        }
        .neon-title { 
          font-size: 5rem; 
          font-weight: 900; 
          color: #fff; 
          text-shadow: 0 0 20px #E50914; 
          animation: flicker 2s infinite; 
          margin-bottom: 20px;
        }
        .card-box { 
          width: 160px; 
          height: 160px; 
          background: rgba(255,255,255,0.05); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 4rem; 
          cursor: pointer; 
          transition: 0.3s; 
        }
        .card-box:hover { 
          transform: scale(1.1) rotateX(10deg); 
          background: rgba(229, 9, 20, 0.2); 
          border-color: #E50914; 
          box-shadow: 0 0 30px #E50914; 
        }
        @keyframes flicker { 
          0%, 100% { text-shadow: 0 0 20px #E50914; opacity: 1; } 
          50% { text-shadow: none; opacity: 0.8; } 
        }
      `}</style>
      <h1 className="neon-title">AI NEWSROOM</h1>
      <h2 style={{color:'#888', marginBottom:'50px'}}>접속 모드를 선택하세요</h2>
      <div style={{display:'flex', gap:'40px'}}>
        <div style={{textAlign:'center'}} onClick={() => onSelectMode('reporter')}>
          <div className="card-box">🎙️</div>
          <div style={{marginTop:'15px', color:'#aaa', fontWeight: 'bold'}}>기자실 (Dashboard)</div>
        </div>
        <div style={{textAlign:'center'}} onClick={() => onSelectMode('viewer')}>
          <div className="card-box">🍿</div>
          <div style={{marginTop:'15px', color:'#aaa', fontWeight: 'bold'}}>방구석 1열 (Viewer)</div>
        </div>
      </div>
    </div>
  );
};

export default NetflixIntro;
