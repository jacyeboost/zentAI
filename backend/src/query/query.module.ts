import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { AiModule } from '../ai/ai.module';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [AiModule, McpModule],
  controllers: [QueryController],
})
export class QueryModule {}
