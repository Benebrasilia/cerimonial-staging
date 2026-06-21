"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type EvAdmin = {
  id: string; nome: string; slug: string; plano: string; dono: string | null;
  criado: string; data: string | null; confirmacoes: number; views_total: number; views_unicos: number;
};

export default function Sistema() {
  const supabase = createClient();
  const [estado, setEstado] = useState<"carregando" | "negado" | "ok">("carregando");
  const [eventos, setEventos] = useState<EvAdmin[]>([]);
  const [admins, setAdmins] = useState<{ email: string; tem_conta: boolean }[]>([]);
  const [eu, setEu] = useState<string | null>(null);
  const [novoAdmin, setNovoAdmin] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function carregar() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }
    const { data, error } = await supabase.rpc("admin_eventos");
    const d = data as { ok?: boolean; error?: string; eventos?: EvAdmin[] } | null;
    if (error || !d || d.error || !d.ok) { setEstado("negado"); return; }
    setEventos(d.eventos || []);
    const { data: ad } = await supabase.rpc("admin_admins");
    const da = ad as { ok?: boolean; admins?: { email: string; tem_conta: boolean }[]; eu?: string } | null;
    if (da && da.ok) { setAdmins(da.admins || []); setEu(da.eu || null); }
    setEstado("ok");
  }

  async function addAdmin() {
    const e = novoAdmin.trim();
    if (!e) return;
    setBusy("add-admin");
    const { data } = await supabase.rpc("admin_add", { p_email: e });
    const d = data as { ok?: boolean; error?: string } | null;
    if (d && d.error === "email") alert("E-mail inválido.");
    setNovoAdmin("");
    await carregar();
    setBusy(null);
  }

  async function removeAdmin(email: string) {
    if (!confirm(`Remover ${email} dos administradores?`)) return;
    setBusy("rm-" + email);
    await supabase.rpc("admin_remove", { p_email: email });
    await carregar();
    setBusy(null);
  }

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const [confirmar, setConfirmar] = useState<string | null>(null);
  async function togglePlano(ev: EvAdmin) {
    if (confirmar !== ev.id) { setConfirmar(ev.id); return; }
    setConfirmar(null);
    const novo = ev.plano === "pro" ? "lite" : "pro";
    setBusy(ev.id);
    await supabase.rpc("admin_set_plano", { p_evento_id: ev.id, p_plano: novo });
    await carregar();
    setBusy(null);
  }

  if (estado === "carregando") return <div className="grid min-h-screen place-items-center text-gray-500">Carregando…</div>;
  if (estado === "negado") return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-bold text-red-600">Acesso restrito</h1>
        <p className="mt-2 text-sm text-gray-600">Esta área é exclusiva para administradores do sistema.</p>
        <a href="/conta" className="mt-4 inline-block text-sm font-semibold text-green-700 hover:underline">Voltar para minha conta</a>
      </div>
    </div>
  );

  const totViews = eventos.reduce((s, e) => s + e.views_total, 0);
  const totUnicos = eventos.reduce((s, e) => s + e.views_unicos, 0);
  const totPro = eventos.filter((e) => e.plano === "pro").length;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex items-center justify-between bg-gray-900 px-5 py-3 text-white">
        <div className="font-bold">⚙️ Confirmae · Administração do sistema</div>
        <a href="/conta" className="rounded-md border border-white/40 px-3 py-1 text-sm hover:bg-white/10">Minha conta</a>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card n={eventos.length} t="Eventos" />
          <Card n={totPro} t="Eventos Pro" />
          <Card n={totUnicos} t="Visitantes únicos" />
          <Card n={totViews} t="Pageviews totais" />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Dono</th>
                <th className="px-3 py-2 text-center">Plano</th>
                <th className="px-3 py-2 text-center">Pageviews</th>
                <th className="px-3 py-2 text-center">Únicos</th>
                <th className="px-3 py-2 text-center">Confirm.</th>
                <th className="px-3 py-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-3 py-2">
                    <a href={`/e/${e.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-green-700 hover:underline">{e.nome}</a>
                    <div className="text-xs text-gray-400">/e/{e.slug}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{e.dono || "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.plano === "pro" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {e.plano === "pro" ? "Pro" : "Lite"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-semibold">{e.views_total}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{e.views_unicos}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{e.confirmacoes}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => togglePlano(e)}
                      disabled={busy === e.id}
                      className={`rounded-md px-3 py-1 text-xs font-semibold disabled:opacity-50 ${e.plano === "pro" ? "border border-gray-300 text-gray-600 hover:bg-gray-50" : "bg-amber-500 text-white hover:bg-amber-600"}`}
                    >
                      {busy === e.id ? "…" : confirmar === e.id ? "Confirmar?" : e.plano === "pro" ? "Tornar Lite" : "Habilitar Pro"}
                    </button>
                  </td>
                </tr>
              ))}
              {!eventos.length && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Nenhum evento ainda.</td></tr>}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-lg font-bold text-gray-800">Administradores do sistema</h2>
        <p className="text-sm text-gray-500">Quem pode acessar esta área e habilitar o Pro. Adicione pelo e-mail (a pessoa precisa criar conta com esse e-mail).</p>
        <div className="mt-3 max-w-xl rounded-xl border bg-white p-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={novoAdmin}
              onChange={(ev) => setNovoAdmin(ev.target.value)}
              onKeyDown={(ev) => ev.key === "Enter" && addAdmin()}
              placeholder="email@exemplo.com"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-800"
            />
            <button onClick={addAdmin} disabled={busy === "add-admin"} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
              {busy === "add-admin" ? "…" : "Adicionar admin"}
            </button>
          </div>
          <ul className="mt-3 divide-y">
            {admins.map((a) => (
              <li key={a.email} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {a.email}
                  {a.email === eu && <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">você</span>}
                  {!a.tem_conta && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">sem conta ainda</span>}
                </span>
                {a.email !== eu && (
                  <button onClick={() => removeAdmin(a.email)} disabled={busy === "rm-" + a.email} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
                    remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

function Card({ n, t }: { n: number; t: string }) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center">
      <div className="text-2xl font-bold text-green-700">{n}</div>
      <div className="text-xs text-gray-500">{t}</div>
    </div>
  );
}
