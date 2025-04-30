
import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env instead of process.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For development/demo purposes, create a mock Supabase client if env vars are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables missing. Using mock Supabase client.');
  
  // Create a mock client that returns empty data
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    }),
    auth: {
      signIn: () => Promise.resolve({ user: null, session: null, error: null }),
      signUp: () => Promise.resolve({ user: null, session: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
} else {
  // Create the real Supabase client if env vars are available
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
