import React, { useEffect, useState } from 'react';
import { Pin, Trash2, Calendar, FileText, BarChart3, ChevronRight } from 'lucide-react';
import Modal from './Modal';

interface Report {
  id: string;
  prompt_text: string;
  sql_text: string;
  chart_type: string;
  module: string;
  is_pinned: boolean;
  summary: string;
  created_at: string;
}

interface ReportHistoryProps {
  onSelectReport: (report: Report) => void;
  onlyPinned?: boolean;
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ onSelectReport, onlyPinned = false }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/reports`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
        console.error('Formato de datos inválido:', data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/reports/${id}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !currentPin }),
      });
      fetchReports();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const confirmDelete = (id: string) => {
    setReportToDelete(id);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/reports/${reportToDelete}`, {
        method: 'DELETE',
      });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-slate-400">Cargando historial...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border-l border-white/5 w-80 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          {onlyPinned ? 'Destacados' : 'Historial'}
        </h3>
        <button className="text-slate-400 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {reports.filter(r => onlyPinned ? r.is_pinned : true).length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <FileText className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">
              {onlyPinned ? 'No hay reportes destacados' : 'No hay reportes guardados'}
            </p>
          </div>
        ) : (
          reports
            .filter(r => onlyPinned ? r.is_pinned : true)
            .map((report) => (
            <div
              key={report.id}
              className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer relative"
              onClick={() => onSelectReport(report)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {report.module}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(report.id, report.is_pinned);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      report.is_pinned ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" fill={report.is_pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(report.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-200 font-medium line-clamp-2 mb-2 leading-relaxed">
                {report.prompt_text}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {report.chart_type}
                </span>
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>


      <Modal 
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Reporte"
        message="¿Estás seguro de que deseas eliminar este reporte del historial? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isDestructive
      />
    </div>
  );
};

export default ReportHistory;
