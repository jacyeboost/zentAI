import React from 'react';

interface DataTableProps {
  data: any[];
  columns: string[];
  maxHeight?: string;
  onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, maxHeight, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/20">
        No hay datos disponibles.
      </div>
    );
  }

  const formatValue = (val: any, col: string) => {
    if (val === null || val === undefined) return '-';
    
    const num = Number(val);
    const key = col.toLowerCase();
    
    // Heuristic for currency
    const isCurrency = ['precio', 'monto', 'venta', 'costo', 'total', 'revenue', 'sales', 'ingreso'].some(k => key.includes(k)) && 
                       !['cantidad', 'unidades', 'quantity', 'count', 'volumen', 'ctd'].some(k => key.includes(k));

    if (!isNaN(num) && typeof val !== 'boolean' && val !== '') {
      return new Intl.NumberFormat('es-MX', { 
        style: isCurrency ? 'currency' : 'decimal', 
        currency: 'MXN',
        minimumFractionDigits: isCurrency ? 2 : 0,
        maximumFractionDigits: 2 
      }).format(num);
    }
    return String(val);
  };

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative"
      style={{ maxHeight: maxHeight || 'none' }}
    >
      <div className="overflow-x-auto overflow-y-auto w-full custom-scrollbar" style={{ maxHeight: maxHeight || 'auto' }}>
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 border-b border-slate-700/50 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors group ${onRowClick ? 'cursor-pointer hover:bg-primary-600/10' : 'hover:bg-white/5'}`}
              >
                {columns.map((col) => (
                  <td key={col} className="px-6 py-3 text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">
                    {formatValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
