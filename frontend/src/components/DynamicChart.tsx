import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DynamicChartProps {
  type: 'bar' | 'line' | 'pie' | 'table';
  data: any[];
  columns: string[];
}

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

const DynamicChart: React.FC<DynamicChartProps> = ({ type, data, columns }) => {
  if (type === 'table' || !data || data.length === 0) return null;

  // Pre-process data: Convert numeric strings to actual numbers
  const processedData = React.useMemo(() => {
    return data.map(item => {
      const newItem: any = { ...item };
      columns.forEach(col => {
        const val = item[col];
        // If it's a string that looks like a number, convert it
        if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
          newItem[col] = Number(val);
        }
      });
      return newItem;
    });
  }, [data, columns]);

  // Attempt to find dynamic keys for X and Y axes
  // X axis: Prefer 'date', 'month', 'time', 'year', 'category' or first string column
  const labelKey = columns.find(col => {
    const lower = col.toLowerCase();
    return ['date', 'fecha', 'month', 'mes', 'year', 'año', 'time', 'tiempo', 'period', 'periodo'].some(k => lower.includes(k));
  }) || columns.find(col => typeof processedData[0][col] === 'string') || columns[0];

  // Y axis: Prefer 'sales', 'revenue', 'count', 'total', etc. or first number column
  const valueKey = columns.find(col => {
    const lower = col.toLowerCase();
    return ['sale', 'venta', 'revenue', 'ingreso', 'amount', 'monto', 'total', 'count', 'cantidad', 'sum'].some(k => lower.includes(k));
  }) || columns.find(col => typeof processedData[0][col] === 'number') || columns[columns.length - 1];

  // Determine format based on column name heuristic
  const getFormatter = (value: number) => {
    const key = valueKey.toLowerCase();
    const isCurrency = ['precio', 'monto', 'venta', 'costo', 'total', 'revenue', 'sales', 'ingreso'].some(k => key.includes(k)) && 
                       !['cantidad', 'unidades', 'quantity', 'count', 'volumen', 'ctd'].some(k => key.includes(k));
    
    return new Intl.NumberFormat('es-MX', {
      style: isCurrency ? 'currency' : 'decimal',
      currency: 'MXN',
      maximumFractionDigits: isCurrency ? 2 : 0,
    }).format(value);
  };

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-400 text-xs mb-1 font-medium">{label}</p>
          <p className="text-primary-400 font-bold">
            {getFormatter(Number(payload[0].value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] mt-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl animate-in zoom-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey={labelKey} 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => 
                new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0,
                  notation: value > 1000000 ? 'compact' : 'standard'
                }).format(value)
              }
            />
            <Tooltip content={renderTooltip} cursor={{ fill: '#1e293b' }} />
            <Bar 
              dataKey={valueKey} 
              fill="url(#primaryGradient)" 
              radius={[6, 6, 0, 0]} 
              barSize={40}
            />
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey={labelKey} 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => 
                new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0,
                  notation: value > 1000000 ? 'compact' : 'standard'
                }).format(value)
              }
            />
            <Tooltip content={renderTooltip} />
            <Line 
              type="monotone" 
              dataKey={valueKey} 
              stroke="#0ea5e9" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey={valueKey}
              nameKey={labelKey}
            >
              {processedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicChart;
