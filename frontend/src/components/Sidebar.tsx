import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, active, onClick, isCollapsed }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200 group relative
      ${active 
        ? 'bg-primary-600/20 text-primary-400 border-l-4 border-primary-500 shadow-sm shadow-primary-500/20' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
      ${isCollapsed ? 'justify-center px-0' : ''}
    `}
    title={isCollapsed ? label : ''}
  >
    <div className={`transition-transform duration-200 ${isCollapsed ? '' : 'mr-3'}`}>
      {icon}
    </div>
    {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
    
    {isCollapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-slate-700 shadow-xl">
        {label}
      </div>
    )}
  </div>
);

interface SidebarProps {
  onHistoryClick?: () => void;
  onFeaturedClick?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isOpen: boolean; // For mobile
  onMobileClose: () => void;
}
 
const Sidebar: React.FC<SidebarProps> = ({ 
  onHistoryClick, 
  onFeaturedClick, 
  isCollapsed, 
  setIsCollapsed,
  isOpen,
  onMobileClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        onClick={onMobileClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <img src="/logo.png" alt="zent" className="h-16 w-auto mb-1" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">BI Intelligence</p>
            </div>
          )}
          {isCollapsed && <img src="/logo.png" alt="z" className="h-8 w-auto" />}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-6">
          <div>
            {!isCollapsed && (
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-4">
                Dashboards
              </div>
            )}
            <SidebarItem 
              label="Tablero Principal" 
              icon={<LayoutDashboard size={20} />} 
              active={true} 
              isCollapsed={isCollapsed}
            />
          </div>

          <div>
            {!isCollapsed && (
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-4">
                Análisis
              </div>
            )}
            <SidebarItem 
              label="Historial" 
              icon={<History size={20} />} 
              onClick={onHistoryClick} 
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              label="Destacados" 
              icon={<Star size={20} />} 
              onClick={onFeaturedClick} 
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="pt-6 border-t border-slate-800/50">
            {!isCollapsed && (
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-4">
                Sistema
              </div>
            )}
            <SidebarItem label="Ajustes" icon={<Settings size={20} />} isCollapsed={isCollapsed} />
            <SidebarItem label="Ayuda" icon={<HelpCircle size={20} />} isCollapsed={isCollapsed} />
          </div>
        </nav>

        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-600/30 flex-shrink-0">
              JD
            </div>
            {!isCollapsed && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                <p className="text-sm font-semibold text-slate-200 leading-none">Jac</p>
                <p className="text-[10px] text-slate-500 mt-1">Administrator</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
             <button className="w-full mt-4 flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                <LogOut size={14} />
                Cerrar Sesión
             </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

