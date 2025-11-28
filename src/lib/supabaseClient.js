import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('Supabase client initialized:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  timestamp: new Date().toISOString()
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'analog-alley-auth',
  },
});

supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Initial session check error:', error);
  } else {
    console.log('Session check successful:', data.session ? 'User logged in' : 'No active session');
  }
}).catch(err => {
  console.error('Connection test failed:', err);
});
