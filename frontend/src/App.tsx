import React, { useState } from 'react';
import MainLayout from './layout/MainLayout';
import DynamicChart from './components/DynamicChart';
import ReportHistory from './components/ReportHistory';
import { Save, History as HistoryIcon, X, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';
import { exportToCSV, exportToPDF } from './utils/exportUtils';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'visual' | 'table'>('visual');
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3005/api/v1/natural-query', {
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
      const response = await fetch('http://localhost:3005/api/v1/reports', {
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
        alert('Reporte guardado con éxito');
      }
    } catch (err) {
      console.error('Error saving report:', err);
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

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-700">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard de Inteligencia</h2>
            <p className="text-slate-400 mt-1">Análisis dinámico impulsado por Gemini 3.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
            >
              <HistoryIcon className="w-4 h-4" />
              Historial
            </button>
            {results && (
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setViewType('visual')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'visual' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Gráfico
                </button>
                <button 
                  onClick={() => setViewType('table')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'table' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
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
          <div className="relative p-8 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full bg-primary-500 ${loading ? 'animate-ping' : ''}`}></span>
              Consultar a la IA
            </h3>
            <p className="text-slate-400 text-sm mb-6">Describe lo que necesitas analizar usando lenguaje natural.</p>
            
            <div className="flex gap-4">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="Ej: '¿Cuáles fueron las ventas del último trimestre por categoría?'"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-500 transition-all italic text-sm"
                disabled={loading}
              />
              <button 
                onClick={handleQuery}
                disabled={loading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2 group-hover:scale-105 active:scale-95"
              >
                {loading ? 'Pensando...' : 'Preguntar'}
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
            <div className="p-6 bg-primary-600/10 border border-primary-500/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-primary-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                  Insight de la IA
                </h4>
                <button 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg text-xs font-bold border border-primary-500/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Guardando...' : 'Guardar en Historial'}
                </button>
              </div>
              <p className="text-slate-200 leading-relaxed text-lg font-medium pr-20">
                {results.metadata.summary}
              </p>
            </div>

            {/* Visualizer / Table Toggle */}
            {viewType === 'visual' && results.metadata.chartType !== 'table' ? (
              <DynamicChart 
                type={results.metadata.chartType} 
                data={results.data} 
                columns={results.metadata.columns} 
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <h4 className="font-bold text-white text-sm">Explorador de Datos</h4>
                  <div className="text-[10px] text-slate-500 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    {results.metadata.sql}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/30 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      <tr>
                        {results.metadata.columns.map((col: string) => (
                          <th key={col} className="px-6 py-4">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {results.data.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-primary-600/5 transition-colors group">
                          {results.metadata.columns.map((col: string) => (
                            <td key={col} className="px-6 py-4 text-slate-300 group-hover:text-white transition-colors">
                              {(() => {
                                const val = row[col];
                                const num = Number(val);
                                // Check if it's a valid number (and not an empty string which Number() converts to 0)
                                if (!isNaN(num) && val !== '' && val !== null) {
                                  return new Intl.NumberFormat('es-MX', { 
                                    style: 'decimal', 
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2 
                                  }).format(num);
                                }
                                return val;
                              })()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Panel Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="relative z-10 w-96 bg-slate-900 border-l border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-primary-400" />
                Historial de Consultas
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ReportHistory onSelectReport={handleSelectHistoryReport} />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default App;
