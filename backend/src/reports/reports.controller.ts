import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() report: any) {
    return this.reportsService.create(report);
  }

  @Get()
  findAll(@Query('module') module?: string) {
    return this.reportsService.findAll(module);
  }

  @Get('pinned')
  findPinned() {
    return this.reportsService.findPinned();
  }

  @Patch(':id/pin')
  togglePin(
    @Param('id') id: string,
    @Body('is_pinned') isPinned: boolean,
  ) {
    return this.reportsService.togglePin(id, isPinned);
  }

  @Post(':id/share')
  share(@Param('id') id: string) {
    return this.reportsService.share(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
