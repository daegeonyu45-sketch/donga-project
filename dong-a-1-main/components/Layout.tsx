
import React from 'react';
import { ViewType } from '../types';
import { 
  Zap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, isMockMode, setIsMockMode }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 transition-all border-b border-slate-800/50" 
           style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <div className="container-fluid flex items-center justify-between w-full max-w-[1600px] mx-auto">
          {/* Logo */}
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 font-bold text-xl text-white hover:opacity-80 transition-opacity"
          >
            <i className="bi bi-newspaper me-2 text-blue-500"></i>
            <span className="tracking-tighter">DONG-A <span className="text-blue-500">AI</span></span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex items-center gap-1 mb-0 list-none p-0 align-items-center">
                <li className="nav-item">
                    <button 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'dashboard' ? 'text-white bg-white/5 shadow-inner' : 'text-slate-400 hover:text-white'}`} 
                        onClick={() => setActiveView('dashboard')}
                    >
                        <i className="bi bi-grid-fill"></i>
                        <span>기획실</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'writer' ? 'text-white bg-white/5 shadow-inner' : 'text-slate-400 hover:text-white'}`} 
                        onClick={() => setActiveView('writer')}
                    >
                        <i className="bi bi-pen-fill"></i>
                        <span>AI Writer</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'illustrator' ? 'text-white bg-white/5 shadow-inner' : 'text-slate-400 hover:text-white'}`} 
                        onClick={() => setActiveView('illustrator')}
                    >
                        <i className="bi bi-image-fill"></i>
                        <span>AI Illustrator</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'headline' ? 'text-white bg-white/5 shadow-inner' : 'text-slate-400 hover:text-white'}`} 
                        onClick={() => setActiveView('headline')}
                    >
                        <i className="bi bi-lightbulb-fill"></i>
                        <span>제목 학원</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'comments' ? 'text-white bg-white/5 shadow-inner' : 'text-slate-400 hover:text-white'}`} 
                        onClick={() => setActiveView('comments')}
                    >
                        <i className="bi bi-chat-dots-fill"></i>
                        <span>댓글 예측</span>
                    </button>
                </li>
            </ul>
          </div>

          {/* User Profile & Utils */}
          <div className="flex items-center gap-4">
            {/* Mock Mode Toggle */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isMockMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isMockMode ? 'text-amber-400' : 'text-slate-500'}`}>
                <Zap size={12} className={isMockMode ? 'text-amber-400 animate-pulse' : 'text-slate-600'} />
                {isMockMode ? 'Demo Mode' : 'Real AI'}
              </span>
              <button 
                onClick={() => setIsMockMode(!isMockMode)}
                className={`w-10 h-5 rounded-full transition-all relative p-1 ${isMockMode ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMockMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 text-white border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-tight">정용인 기자님</p>
                <p className="text-[10px] text-slate-500 font-medium">디지털이노베이션팀</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center rounded-full font-bold text-sm text-white shadow-lg border border-white/10">
                JH
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav Overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around p-2 z-50">
        <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`}>
          <i className="bi bi-grid-fill text-xl"></i>
          <span className="text-[10px] mt-1 font-medium">기획실</span>
        </button>
        <button onClick={() => setActiveView('writer')} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === 'writer' ? 'text-blue-400' : 'text-slate-500'}`}>
          <i className="bi bi-pen-fill text-xl"></i>
          <span className="text-[10px] mt-1 font-medium">AI Writer</span>
        </button>
      </div>
    </div>
  );
};

export default Layout;
