import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { McpService } from '../mcp/mcp.service';

@Controller('natural-query')
export class QueryController {
  constructor(
    private readonly aiService: AiService,
    private readonly mcpService: McpService,
  ) {}

  @Post()
  async handleQuery(@Body() body: { prompt: string; context: string }) {
    const { prompt, context } = body;

    if (!prompt) {
      throw new HttpException('El prompt es requerido', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1. Generar SQL y Recomendación de Gráfico con Gemini
      const { sql, chartType } = await this.aiService.generateSql(prompt, context || 'ventas');
      
      // 2. Ejecutar SQL vía MCP
      const data = await this.mcpService.executeQuery(sql);
      
      // 3. Generar Resumen Ejecutivo con Gemini
      const summary = await this.aiService.generateExecutiveSummary(data, prompt);

      return {
        success: true,
        data,
        metadata: {
          sql,
          summary,
          chartType,
          columns: data.length > 0 ? Object.keys(data[0]) : [],
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error procesando la consulta',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
