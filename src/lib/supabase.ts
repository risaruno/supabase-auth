import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is missing. Please check your environment variables.');
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}

export interface Database {
  public: {
    tables: Record<string, never>
    views: Record<string, never>
    functions: Record<string, never>
    enums: Record<string, never>
  }
}
