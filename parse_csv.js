const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\jacye\\OneDrive\\Documentos\\Jac\\Proyectos\\Finobank\\Reporte_Ventas_20260123_100059.csv';
const outputFile = 'C:\\Jac\\Desarrollo\\Apps-IA\\zentAI\\insert_batches.sql';

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim() !== '');

const dataRows = lines.slice(21); // Skip header and first 20 rows already inserted

const BATCH_SIZE = 300;
let sqlOutput = '';

function escapeSql(str) {
    if (str === undefined || str === null || str.trim() === '') return 'NULL';
    // Escape single quotes
    return `'${str.replace(/'/g, "''")}'`;
}

function formatValue(val, index) {
    if (val === undefined || val === null || val.trim() === '') return 'NULL';
    
    // Column indices that are numeric (based on correct mapping)
    // 0: orden_venta_id, 3: linea_orden_venta_id, 4: id_operacion, 8: producto_id, 
    // 11: cantidad, 13: monto_divisa_origen, 14: monto_mxn, 15: costo_producto_mxn, 
    // 16: costo_factura_mxn, 17: costo_total_mxn, 18: costo_unitario_mxn, 19: precio_unitario_mxn
    const numericIndices = [0, 3, 4, 8, 11, 13, 14, 15, 16, 17, 18, 19]; 
    // Date indices: 2: fecha_orden, 6: fecha_traslado
    const dateIndices = [2, 6];

    if (dateIndices.includes(index)) {
        return escapeSql(val);
    }
    
    if (numericIndices.includes(index)) {
        // Clean numeric value
        const cleanVal = val.replace(/[^0-9.-]/g, '');
        return cleanVal === '' ? 'NULL' : cleanVal;
    }

    return escapeSql(val);
}

for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
    const batch = dataRows.slice(i, i + BATCH_SIZE);
    sqlOutput += `-- BATCH ${Math.floor(i / BATCH_SIZE) + 2}\n`;
    sqlOutput += `INSERT INTO ventas (orden_venta_id, orden_venta_nombre, fecha_orden, linea_orden_venta_id, id_operacion, nombre_operacion, fecha_traslado, ubicacion, producto_id, nombre_producto, unidad_medida, cantidad, divisa_origen, monto_divisa_origen, monto_mxn, costo_producto_mxn, costo_factura_mxn, costo_total_mxn, costo_unitario_mxn, precio_unitario_mxn) VALUES\n`;
    
    const valueRows = batch.map(line => {
        const cols = line.split(',');
        // Ensure we only take the first 20 columns
        return '(' + cols.slice(0, 20).map((col, idx) => formatValue(col, idx)).join(',') + ')';
    });
    
    sqlOutput += valueRows.join(',\n') + ';\n\n';
}

fs.writeFileSync(outputFile, sqlOutput);
console.log(`Generated SQL for ${dataRows.length} rows in ${Math.ceil(dataRows.length / BATCH_SIZE)} batches.`);
