import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hosting dashboards (e.g. Vercel) keep quotes/whitespace pasted from .env files. Clean them so the
// client can never throw at startup (which leaves a blank white page).
const clean = (v: unknown) => String(v ?? '').trim().replace(/^["']+|["']+$/g, '').trim();
const isHttpUrl = (v: string) => { try { return /^https?:$/.test(new URL(v).protocol); } catch { return false; } };

const rawUrl = clean(import.meta.env.VITE_SUPABASE_URL);
const supabaseUrl = isHttpUrl(rawUrl) ? rawUrl : '';
const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
