import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } else {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
    }
  }

  async generateSql(prompt: string, context: string): Promise<{ sql: string; chartType: string }> {
    const systemPrompt = `
      Eres un experto en SQL para PostgreSQL y visualización de datos.
      
      TABLAS DISPONIBLES:
      - compras (id, monto, fecha, categoria, proveedor)
      - mermas (id, cantidad, motivo, fecha, producto_id)
      - produccion (id, producto, cantidad, fecha, costo_unitario)
      - ventas (
          id, orden_venta_id, orden_venta_nombre, 
          id_operacion, nombre_operacion, fecha_traslado, ubicacion (o Invernadero), producto_id, 
          nombre_producto, unidad_medida, cantidad, divisa_origen, monto_divisa_origen, 
          precio_unitario_mxn
        ), 
      CONSIDERACIONES:
      - considera tomar la fecha_orden sin la hora/min/seg.
      - EL FORMATO DE LA FECHA ES: YYYY-MM-DD HH:MM:SS

      TAREA:
      1. Genera una consulta SQL (SELECT).
      2. Sugiere el tipo de gráfico más adecuado ('bar', 'line', 'pie' o 'table').
         - 'line': Para tendencias temporales (ventas por mes, etc).
         - 'bar': Para comparaciones (ventas por categoría, top 5, etc).
         - 'pie': Para distribuciones (mermas por motivo, etc).
         - 'table': Si los datos son muy complejos o no encajan en los anteriores.

      REGLAS:
      - Responde ÚNICAMENTE en formato JSON con las llaves "sql" y "recommendedChartType".
      - No incluyas explicaciones.
      - Solo lectura (SELECT).

      CONTEXTO: ${context}
      CONSULTA DEL USUARIO: ${prompt}
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().trim();
      this.logger.log(`Raw Gemini Response: ${text}`); // Debug log
      
      // Extract JSON from potential identifiers
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error(`Invalid JSON structure received: ${text}`);
        throw new Error('No valid JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        sql: parsed.sql,
        chartType: parsed.recommendedChartType || 'table'
      };
    } catch (error) {
      this.logger.error(`AI Model Error: ${error.message}`);
      if (error.response) {
        this.logger.error(`API Error Details: ${JSON.stringify(error.response)}`);
      }
      throw new Error('Error de comunicación con la IA. Verifique el modelo y la API Key.');
    }
  }

  async generateExecutiveSummary(data: any[], prompt: string): Promise<string> {
    const systemPrompt = `
      Eres un analista de Business Intelligence experto.
      A continuación se presentan los resultados de una consulta basada en la pregunta: "${prompt}".
      
      DATOS:
      ${JSON.stringify(data, null, 2)}
      
      TAREA:
      Genera un resumen ejecutivo muy breve (máximo 3 frases) que destaque los hallazgos más importantes (tendencias, valores atípicos o totales relevantes).
      Sé directo y profesional. Usa español.
    `;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      this.logger.error('Error generating summary', error);
      return 'No se pudo generar el resumen ejecutivo en este momento.';
    }
  }
}
