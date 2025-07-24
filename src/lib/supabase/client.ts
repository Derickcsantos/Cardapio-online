import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = 'https://cxnoazregfbudvbmxzcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bm9henJlZ2ZidWR2Ym14emNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjc4MjksImV4cCI6MjA2ODk0MzgyOX0.mOQiHhBsjMEzJ_sc2-92ZkVyMezjhHeBhGup6AK4TFw';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);