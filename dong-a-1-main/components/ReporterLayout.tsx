
import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import AIWriter from './AIWriter';
import SupabaseAdminChat from './SupabaseAdminChat';

interface Props {
  onExit: () => void;
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

const ReporterLayout: React.FC<Props> = ({ onExit, isMockMode, setIsMockMode }) => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('donga_reporter_tab') || 'dashboard');
  
  useEffect(() => {
    localStorage.setItem('donga_reporter_tab', activeTab);
  }, [activeTab]);

  const menuStyle = (tab: string) => ({ 
    padding: '8px 20px', 
    cursor: 'pointer', 
    borderRadius: '20px', 
    marginRight: '10px', 
    background: activeTab === tab ? '#E50914' : 'transparent', 
    color: activeTab === tab ? 'white' : '#cbd5e1', 
    fontWeight: 'bold',
    transition: '0.2s',
    border: 'none'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#020617' }}>
      <header style={{ 
        height: '70px', 
        background: '#000', 
        borderBottom: '1px solid #1e293b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 30px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <h3 style={{ color: '#E50914', fontWeight: '900', margin: '0 40px 0 0', cursor: 'pointer', letterSpacing: '-1px' }} onClick={() => setActiveTab('dashboard')}>AI NEWS DESK</h3>
          <nav style={{ display: 'flex' }}>
            <button onClick={() => setActiveTab('dashboard')} style={menuStyle('dashboard') as any}>📊 대시보드</button>
            <button onClick={() => setActiveTab('writer')} style={menuStyle('writer') as any}>✍️ 기사 작성</button>
            <button onClick={() => setActiveTab('admin')} style={menuStyle('admin') as any}>👥 사용자 관리</button>
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div 
            onClick={() => setIsMockMode(!isMockMode)}
            style={{ 
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: isMockMode ? '#f59e0b' : '#60a5fa',
              padding: '4px 12px',
              border: `1px solid ${isMockMode ? '#f59e0b44' : '#3b82f644'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              background: isMockMode ? '#f59e0b11' : '#3b82f611'
            }}
          >
            {isMockMode ? 'DEMO MODE active' : 'LIVE AI active'}
          </div>
          <button onClick={onExit} style={{ padding: '8px 20px', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>나가기</button>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'writer' && <AIWriter isMockMode={isMockMode} setIsMockMode={setIsMockMode} />}
          {activeTab === 'admin' && <SupabaseAdminChat />}
        </div>
      </main>
    </div>
  );
};

export default ReporterLayout;
