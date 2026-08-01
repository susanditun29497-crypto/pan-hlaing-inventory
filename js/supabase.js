const SUPABASE_URL = "https://uyoxyehsywiyrxcpvmun.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5b3h5ZWhzeXdpeXJ4Y3B2bXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTE0MzksImV4cCI6MjEwMTEyNzQzOX0.uLN5eAAf4RD-Pa39KbBCHDQXrCKDnicKEouGPvjLXFU";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);