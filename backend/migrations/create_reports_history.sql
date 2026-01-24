-- Create reports_history table
CREATE TABLE IF NOT EXISTS reports_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_text TEXT NOT NULL,
    sql_text TEXT NOT NULL,
    chart_type TEXT DEFAULT 'table',
    module TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE reports_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (for now, for testing)
CREATE POLICY "Allow public read/write" ON reports_history
    FOR ALL USING (true) WITH CHECK (true);
