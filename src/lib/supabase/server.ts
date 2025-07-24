import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    'https://cxnoazregfbudvbmxzcd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bm9henJlZ2ZidWR2Ym14emNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjc4MjksImV4cCI6MjA2ODk0MzgyOX0.mOQiHhBsjMEzJ_sc2-92ZkVyMezjhHeBhGup6AK4TFw',
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}