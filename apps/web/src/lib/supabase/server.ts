import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerConfig } from "@ocean/db";

export const supabaseServer = () => {
  const { url, serviceRoleKey } = getSupabaseServerConfig();
  return createClient(url, serviceRoleKey);
};
