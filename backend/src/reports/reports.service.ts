import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ReportsService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not defined in environment variables');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(report: any) {
    const { data, error } = await this.supabase
      .from('reports_history')
      .insert([report])
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  }

  async findAll(module?: string) {
    let query = this.supabase
      .from('reports_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (module) {
      query = query.eq('module', module);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data;
  }

  async findPinned() {
    const { data, error } = await this.supabase
      .from('reports_history')
      .select('*')
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async togglePin(id: string, isPinned: boolean) {
    const { data, error } = await this.supabase
      .from('reports_history')
      .update({ is_pinned: isPinned, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  }

  async share(id: string) {
    const shareUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'}/share/${id}`;
    return { url: shareUrl };
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .from('reports_history')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { deleted: true };
  }
}
