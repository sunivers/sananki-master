import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a mock client that will be handled by sample data functions
    return null as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

