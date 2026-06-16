// Busca os dados públicos de um evento pelo slug (função SECURITY DEFINER
// que expõe apenas campos públicos). Funciona no servidor e no cliente.
export type EventoPublico = {
  id: string;
  nome: string;
  data: string | null;
  horario: string | null;
  local: string | null;
  ultimo_passo: boolean;
  config: Record<string, unknown> | null;
};

export async function getEventoPublico(slug: string): Promise<EventoPublico | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/evento_publico`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_slug: slug }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length ? (rows[0] as EventoPublico) : null;
  } catch {
    return null;
  }
}

export function formatarData(data: string | null): string {
  if (!data) return "";
  try {
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch {
    return data;
  }
}
