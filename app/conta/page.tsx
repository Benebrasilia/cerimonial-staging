"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Ev = { id: string; nome: string; slug: string };

export default function Conta() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      setEmail(session.user.email ?? null);
      const { data } = await supabase.from("eventos").select("id,nome,slug").order("created_at", { ascending: false });
      setEventos((data as Ev[]) || []);
      setLoading(false);
    })();
  }, []);

  async function sair() { await supabase.auth.signOut(); window.location.href = "/login"; }

  if (loading) return <div className="grid min-h-screen place-items-center text-gray-500">Carregando…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">Meus eventos</h1>
        <button onClick={sair} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Sair</button>
      </div>
      <p className="mt-1 text-sm text-gray-500">{email}</p>
      <div className="mt-4 space-y-2">
        {eventos.length ? eventos.map((e) => (
          <a key={e.id} href={`/e/${e.slug}/painel`} className="block rounded-lg border bg-white p-3 hover:bg-gray-50">
            <b className="text-green-700">{e.nome}</b>
            <div className="text-xs text-gray-500">/e/{e.slug}</div>
          </a>
        )) : <p className="text-sm text-gray-400">Você ainda não tem eventos.</p>}
      </div>
    </div>
  );
}
