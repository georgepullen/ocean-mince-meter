export type SupabaseBrowserConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseServerConfig = {
  url: string;
  serviceRoleKey: string;
};

function requireEnv(key: string, env: Record<string, string | undefined>) {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getSupabaseBrowserConfig(
  env: Record<string, string | undefined> = process.env
): SupabaseBrowserConfig {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL", env),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", env),
  };
}

export function getSupabaseServerConfig(
  env: Record<string, string | undefined> = process.env
): SupabaseServerConfig {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL", env),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY", env),
  };
}
