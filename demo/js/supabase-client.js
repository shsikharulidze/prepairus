// Global Supabase client - used across all pages
if (!window.supabase) console.error("Supabase SDK missing. Check script order.");
if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) console.error("Missing Supabase config.");

window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
console.log("Global Supabase client initialized as window.sb");