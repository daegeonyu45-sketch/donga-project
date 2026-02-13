
import React, { useState } from 'react';

interface Props {
  isMockMode?: boolean;
  setIsMockMode?: (val: boolean) => void;
}

const HeadlineMaker: React.FC<Props> = () => {
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');

  return (
    <div className="glass-card p-4 h-100" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: '15px' }}>
      <h3 className="text-warning fw-bold mb-3">📸 내가 뉴스 주인공?</h3>
      
      <div className="mb-3">
        <input 
          type="text" 
          placeholder="이름 (예: 홍길동)" 
          className="form-control mb-2 bg-dark text-white border-secondary"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="속보 내용 (예: 복권 1등 당첨)" 
          className="form-control bg-dark text-white border-secondary"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </div>

      {/* TV 화면 미리보기 */}
      <div className="position-relative rounded overflow-hidden border border-secondary" style={{ height: '200px', background: '#333' }}>
        <img 
            src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80`} 
            alt="news bg" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
        />
        {/* 뉴스 자막 오버레이 */}
        <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: 'linear-gradient(to right, #cc0000, #990000)' }}>
            <span className="badge bg-white text-danger me-2">속보</span>
            <span className="text-white fw-bold">
                {name ? `${name} 씨, ` : '정용인 씨, '} 
                {headline || '사실 동아일보 홍보대사로 밝혀져...'}
            </span>
        </div>
        <div className="position-absolute top-0 end-0 p-2">
            <span className="badge bg-danger">LIVE</span>
        </div>
      </div>
      
      <button className="btn btn-outline-warning w-100 mt-3" onClick={() => alert('캡처해서 친구들에게 자랑하세요!')}>
        💾 화면 저장 (캡처용)
      </button>
    </div>
  );
};

export default HeadlineMaker;
