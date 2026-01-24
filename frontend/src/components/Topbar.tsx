import React from 'react';
import { Menu, Search, Upload } from 'lucide-react';

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  return (
    <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar análisis, reportes, datos..."
              className="block w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-500 text-slate-300 text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-all border border-slate-700">
          <Upload size={16} />
          <span className="hidden sm:inline">Importar</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary-600/20">
          <span className="hidden sm:inline">Exportar Reporte</span>
          <span className="sm:hidden">Exportar</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;

