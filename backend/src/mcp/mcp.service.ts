import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class McpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
      ssl: { rejectUnauthorized: false }, // Required for Supabase in some environments
    });
    this.logger.log('Conectado a Supabase PostgreSQL via pg pool');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * Ejecuta SQL directamente contra Supabase/Postgres.
   */
  async executeQuery(sql: string): Promise<any[]> {
    this.logger.log(`Ejecutando SQL vía Postgres Driver: ${sql}`);
    
    // Validación básica de seguridad (solo SELECT pero un poco más robusta)
    const normalizedSql = sql.toLowerCase().trim();
    if (!normalizedSql.startsWith('select') && !normalizedSql.startsWith('with')) {
      throw new Error('Seguridad: Solo se permiten consultas de lectura (SELECT/WITH).');
    }

    try {
      const result = await this.pool.query(sql);
      return result.rows;
    } catch (error) {
      this.logger.error('Error ejecutando consulta en DB', error);
      throw new Error(`Error BD: ${error.message}`);
    }
  }
}
