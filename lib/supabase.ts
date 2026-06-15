import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para o navegador.
// As credenciais vêm de variáveis de ambiente, definidas por ambiente
// (staging x produção) no painel do Netlify. A chave publishable/anon é
// pública por design; a proteção real dos dados é feita pelo RLS no banco.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
