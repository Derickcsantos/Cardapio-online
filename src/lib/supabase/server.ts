import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  'https://cxnoazregfbudvbmxzcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bm9henJlZ2ZidWR2Ym14emNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjc4MjksImV4cCI6MjA2ODk0MzgyOX0.mOQiHhBsjMEzJ_sc2-92ZkVyMezjhHeBhGup6AK4TFw'
);
