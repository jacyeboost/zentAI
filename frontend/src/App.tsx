import React, { useState } from 'react';
import MainLayout from './layout/MainLayout';
import DynamicChart from './components/DynamicChart';
import ReportHistory from './components/ReportHistory';
// import { Save, History as HistoryIcon, X, FileSpreadsheet, FileText as FileTextIcon, Star, Share2 } from 'lucide-react';
import { Save, History as HistoryIcon, X, FileSpreadsheet, FileText as FileTextIcon, Star } from 'lucide-react';
import { exportToCSV, exportToPDF } from './utils/exportUtils';
import Toast from './components/Toast';
import Modal from './components/Modal';
import DataTable from './components/DataTable';
import type { ToastType } from './components/Toast';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'visual' | 'table'>('visual');
  const [showHistory, setShowHistory] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Drill Down State
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [loadingDrillDown, setLoadingDrillDown] = useState(false);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/natural-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: query, 
          context: 'ventas' 
        }),
      });

      if (!response.ok) throw new Error('Error en la consulta');
      
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!results) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: query,
          sql_text: results.metadata.sql,
          chart_type: results.metadata.chartType,
          module: 'ventas',
          summary: results.metadata.summary,
        }),
      });
      if (response.ok) {
        setToast({ message: 'Reporte guardado en el historial con éxito', type: 'success' });
      }
    } catch (err) {
      console.error('Error saving report:', err);
      setToast({ message: 'Error al guardar el reporte', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectHistoryReport = (report: any) => {
    setQuery(report.prompt_text);
    // Simular los resultados a partir de los datos guardados
    // En una app real, podrías querer re-ejecutar el SQL o guardar un snapshot de los datos
    // Por ahora, simularemos que "re-ejecuta" para obtener los datos frescos o simplemente mostrar el estado guardado
    // Como el historial no guarda los DATOS (solo el SQL y el resumen), re-ejecutaremos el query.
    handleQuery(); 
    setShowHistory(false);
  };

  const handleExportCSV = () => {
    if (!results) return;
    exportToCSV(results.data, results.metadata.columns, `${query.substring(0, 20)}.csv`);
  };

  const handleExportPDF = () => {
    if (!results) return;
    exportToPDF(results.data, results.metadata.columns, query, results.metadata.summary);
  };

  /*
  const handleShare = async () => {
    if (!results) {
      setToast({ message: "No hay reporte activo para compartir", type: 'error' });
      return;
    }

    let reportId = results.id;

    // If not saved, save it first
    if (!reportId) {
      setIsSaving(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_text: query,
            sql_text: results.metadata.sql,
            chart_type: results.metadata.recommendedChartType,
            module: 'ventas', 
            summary: results.metadata.summary,
            is_pinned: false
          }),
        });
        
        if (!response.ok) throw new Error('Failed to auto-save');
        
        const savedReport = await response.json();
        reportId = savedReport.id;
        
        // Update local state to reflect saved status
        setResults((prev: any) => prev ? { ...prev, id: reportId } : null);
      } catch (err) {
        console.error('Error auto-saving for share:', err);
        setToast({ message: "Error al guardar para compartir", type: 'error' });
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }
    
    // Generate Share Link
    const shareUrl = `${window.location.origin}/share/${reportId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast({ message: "Enlace copiado al portapapeles", type: 'success' });
    } catch (err) {
      console.error("Error al copiar:", err);
      setToast({ message: "Error al copiar enlace", type: 'error' });
    }
  };
  */
  const handleDrillDown = async (data: any) => {
    if (!results) return;
    
    // Identificar la dimensión (ej. "Invernadero 1") y el valor clickeado
    // Buscamos la primera columna de texto para usarla como filtro
    const labelKey = results.metadata.columns.find((col: string) => {
      const val = results.data[0][col];
      return typeof val === 'string';
    }) || results.metadata.columns[0];

    const filterValue = data[labelKey] || data.name || data.payload?.[labelKey]; // Adjust based on data shape from Recharts

    if (!filterValue) return;

    setDrillDownTitle(`Detalle de ${filterValue}`);
    setLoadingDrillDown(true);
    setShowDrillDown(true);
    setDrillDownData(null);

    const drillPrompt = `Muestrame los registros individuales detallados (base de datos cruda) donde ${labelKey} es '${filterValue}'. Incluye todas las columnas relevantes para entender el detalle de estas transacciones. Contexto original de la búsqueda: ${query}`;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/natural-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: drillPrompt, 
          context: 'ventas' // Idealmente esto vendría del metadata del reporte original
        }),
      });

      if (!response.ok) throw new Error('Error al obtener detalle');
      
      const resData = await response.json();
      setDrillDownData(resData);
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Error al cargar el detalle', type: 'error' });
      setShowDrillDown(false);
    } finally {
      setLoadingDrillDown(false);
    }
  };

  return (
    <MainLayout 
      onHistoryClick={() => { setShowHistory(true); setShowFeatured(false); }}
      onFeaturedClick={() => { setShowFeatured(true); setShowHistory(false); }}
    >
      <div className="space-y-6 animate-in fade-in duration-700">
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard de Informes</h2>
            <p className="text-slate-400 mt-1 text-sm md:text-base">Análisis dinámico impulsado por IA.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <button 
              onClick={() => { setShowFeatured(!showFeatured); setShowHistory(false); }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-all text-sm font-medium"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Destacados</span>
              <span className="sm:hidden">Dest.</span>
            </button>
            <button 
              onClick={() => { setShowHistory(!showHistory); setShowFeatured(false); }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
            >
              <HistoryIcon className="w-4 h-4" />
              Historial
            </button>

            {results && (
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setViewType('visual')}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'visual' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Gráfico
                </button>
                <button 
                  onClick={() => setViewType('table')}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'table' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Datos
                </button>
              </div>
            )}
            {results && (
              <div className="flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all shadow-lg shadow-black/20"
                  title="Exportar CSV"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all shadow-lg shadow-black/20"
                  title="Exportar PDF"
                >
                  <FileTextIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* AI Input Section */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full bg-primary-500 ${loading ? 'animate-ping' : ''}`}></span>
              Solicitar un informe
            </h3>
            <p className="text-slate-400 text-sm mb-6">Describe lo que necesitas analizar usando lenguaje natural.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="Ej: '¿Cuáles fueron las ventas del último trimestre por categoría?'"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-500 transition-all italic text-sm min-w-0"
                disabled={loading}
              />
              <button 
                onClick={handleQuery}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95"
              >
                {loading ? 'Pensando...' : 'Generar'}
                {!loading && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom duration-500">
            {/* Executive Summary */}
            <div className="p-5 md:p-6 bg-primary-600/10 border border-primary-500/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none hidden sm:block">
                <svg className="w-16 h-16 md:w-24 md:h-24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 relative z-10">
                <h4 className="text-primary-400 font-bold flex items-center gap-2 text-[10px] md:text-sm uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                  Insight de la IA
                </h4>
                <button 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg text-xs font-bold border border-primary-500/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
              <p className="text-slate-200 leading-relaxed text-base md:text-lg font-medium sm:pr-20">
                {results.metadata.summary}
              </p>
            </div>

            {/* Visualizer / Table Toggle */}
            {viewType === 'visual' && results.metadata.chartType !== 'table' ? (
              <DynamicChart 
                type={results.metadata.chartType} 
                data={results.data} 
                columns={results.metadata.columns} 
                onDataClick={handleDrillDown}
              />
            ) : (
              <DataTable 
                data={results.data} 
                columns={results.metadata.columns} 
                onRowClick={handleDrillDown}
              />
            )}
          </div>
        )}
      </div>

      {/* History Panel Overlay */}
      {(showHistory || showFeatured) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => { setShowHistory(false); setShowFeatured(false); }}></div>
          <div className="relative z-10 w-96 bg-slate-900 border-l border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-primary-400" />
                {showFeatured ? 'Reportes Destacados' : 'Historial de Consultas'}
              </h3>
              <button 
                onClick={() => { setShowHistory(false); setShowFeatured(false); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ReportHistory 
                onSelectReport={(report) => {
                  handleSelectHistoryReport(report);
                  setShowFeatured(false);
                }} 
                onlyPinned={showFeatured}
              />
            </div>
          </div>
        </div>
      )}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <Modal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title={drillDownTitle}
      >
        {loadingDrillDown ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-slate-400 animate-pulse">Analizando detalle de información...</p>
          </div>
        ) : drillDownData ? (
          <div className="mt-2 space-y-6">
             <div className="flex justify-between items-start gap-4">
                <div className="bg-primary-500/5 p-4 rounded-xl border border-primary-500/10 flex-1">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                      {drillDownData.metadata.summary}
                  </p>
                </div>
                <button 
                  onClick={() => exportToCSV(drillDownData.data, drillDownData.metadata.columns, `${drillDownTitle}.csv`)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Exportar CSV
                </button>
             </div>
             
             <div className="space-y-4">
                {drillDownData.metadata.chartType !== 'table' && (
                  <div className="h-[300px]">
                    <DynamicChart 
                      type={drillDownData.metadata.chartType}
                      data={drillDownData.data}
                      columns={drillDownData.metadata.columns}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <h5 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest pl-1">
                    Registros que conforman este dato
                  </h5>
                  <DataTable 
                    data={drillDownData.data}
                    columns={drillDownData.metadata.columns}
                    maxHeight="400px"
                  />
                </div>
             </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            No se encontraron detalles adicionales.
          </div>
        )}
      </Modal>

    </MainLayout>
  );
};

export default App;
