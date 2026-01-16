import { createClient } from "@supabase/supabase-js";

let _supabaseServer = null;

export function getSupabaseServer() {
  if (!_supabaseServer) {
    _supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseServer;
}

// For backwards compatibility - lazy initialization via getter
export const supabaseServer = new Proxy(
  {},
  {
    get(_, prop) {
      return getSupabaseServer()[prop];
    },
  }
);
