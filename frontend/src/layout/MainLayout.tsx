import React from 'react';
import Sidebar from '../components/Sidebar';
//import Topbar from '../components/Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
  onHistoryClick?: () => void;
  onFeaturedClick?: () => void;
  onShare?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onHistoryClick, onFeaturedClick, onShare }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30">
      {/* Sidebar - Fixed */}
      <Sidebar onHistoryClick={onHistoryClick} onFeaturedClick={onFeaturedClick} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* <Topbar onShare={onShare} /> */}
        
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
