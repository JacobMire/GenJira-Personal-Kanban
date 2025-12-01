import { createClient } from '@supabase/supabase-js';

// Safe access to process.env for browser environments
const env = typeof process !== 'undefined' ? process.env : {};

// Access environment variables directly
// We provide fallback strings to prevent the "supabaseUrl is required" error if env vars are missing.
const supabaseUrl = env.SUPABASE_URL || 'https://buzfczfryzzwdfcevcqf.supabase.co';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1emZjemZyeXp6d2RmY2V2Y3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDUxMjcsImV4cCI6MjA3OTk4MTEyN30.XuR36TXJrMsA6FZ1t-7PYHpScIstke2b-OA7U4U-Nfk';

if (!env.SUPABASE_URL) {
  console.warn('Supabase credentials missing! Authentication and Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);