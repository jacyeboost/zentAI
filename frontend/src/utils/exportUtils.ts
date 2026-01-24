import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToCSV = (data: any[], columns: string[], fileName: string = 'export.csv') => {
  if (!data || data.length === 0) return;

  const header = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const val = row[col];
      // Escape commas and wrap in quotes if necessary
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: any[], columns: string[], title: string, summary: string) => {
  const doc = new jsPDF();

  // Primary Color: indigo/primary
  const primaryColor = [79, 70, 229]; // #4f46e5

  // Header Title
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('zentAI - Reporte de Inteligencia', 14, 20);

  // subtitle/date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleString()}`, 14, 28);
  
  // prompt/context
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text('Consulta:', 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 46, { maxWidth: 180 });

  // Summary section
  doc.setFont('helvetica', 'bold');
  doc.text('Insight de la IA:', 14, 60);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  doc.text(summary, 14, 66, { maxWidth: 180 });

  // Line separator
  doc.setDrawColor(200);
  doc.line(14, 85, 196, 85);

  // Data Table
  const tableRows = data.map(row => columns.map(col => row[col]));
  
  doc.autoTable({
    startY: 90,
    head: [columns],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4 
    },
    alternateRowStyles: { 
      fillColor: [245, 247, 251] 
    }
  });

  doc.save(`${title.substring(0, 20).replace(/\s+/g, '_')}_reporte.pdf`);
};
