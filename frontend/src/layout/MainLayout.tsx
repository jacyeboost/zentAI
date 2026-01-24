import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
  onHistoryClick?: () => void;
  onFeaturedClick?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onHistoryClick, onFeaturedClick }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        onHistoryClick={() => { onHistoryClick?.(); setMobileOpen(false); }}
        onFeaturedClick={() => { onFeaturedClick?.(); setMobileOpen(false); }}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

