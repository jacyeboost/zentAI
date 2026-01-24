import React from 'react';

interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`
    flex items-center px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200
    ${active 
      ? 'bg-primary-600/20 text-primary-400 border-l-4 border-primary-500 shadow-sm shadow-primary-500/20' 
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
  `}>
    <span className="font-medium">{label}</span>
  </div>
);

interface SidebarProps {
  onHistoryClick?: () => void;
  onFeaturedClick?: () => void;
}
 
const Sidebar: React.FC<SidebarProps> = ({ onHistoryClick, onFeaturedClick }) => {
  const menuItems = ["Reportes IA"];
  
  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-4">
      <div className="mb-10 px-4">
        <img src="/logo.png" alt="zent" className="h-24 w-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">BI potenciado con IA</p>
      </div>

      <nav className="flex-1 space-y-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-4">
            Dashboards
          </div>
          {menuItems.map((item) => (
            <SidebarItem key={item} label={item} active={item === "Ventas"} />
          ))}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-4">
            Análisis
          </div>
          <SidebarItem label="Historial" onClick={onHistoryClick} />
          <SidebarItem label="Destacados" onClick={onFeaturedClick} />
        </div>
      </nav>

      <div className="mt-auto px-4 py-6 border-t border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary-600/30">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 leading-none">Jacye</p>
            <p className="text-[10px] text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
