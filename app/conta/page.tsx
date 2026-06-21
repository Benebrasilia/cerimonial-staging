"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Ev = { id: string; nome: string; slug: string; plano?: string };
type Plano = { codigo: string; nome: string; valor: number; periodicidade: string };

export default function Conta() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Ev[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState<string | null>(null);
  const pagamentoOk = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("pagamento") === "ok";

  useEffect(() => {
    let carregado = false;
    async function carregar(session: { user: { id: string; email?: string | null } }) {
      if (carregado) return;
      carregado = true;
      setEmail(session.user.email ?? null);
      setUserId(session.user.id);
      const { data } = await supabase.from("eventos").select("id,nome,slug,plano").order("created_at", { ascending: false });
      setEventos((data as Ev[]) || []);
      const { data: pl } = await supabase.from("planos").select("codigo,nome,valor,periodicidade").eq("ativo", true);
      setPlanos((pl as Plano[]) || []);
      setLoading(false);
    }
    // Quando o login (incl. Google/PKCE) conclui, o code vira sessao -> evento SIGNED_IN.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) carregar(session); });
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { carregar(session); return; }
      const temCode = new URLSearchParams(window.location.search).has("code");
      if (!temCode) { window.location.href = "/login"; return; }
      // Tem ?code= na URL: aguarda a troca por sessao; redireciona so se falhar.
      setTimeout(async () => {
        const { data: { session: s2 } } = await supabase.auth.getSession();
        if (!s2 && !carregado) window.location.href = "/login";
      }, 4000);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sair() { await supabase.auth.signOut(); window.location.href = "/login"; }

  async function assinar(tipo: string) {
    setPagando(tipo);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mp_checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, email, cerimonial_id: userId }),
      });
      const d = await r.json();
      if (d.init_point) { window.location.href = d.init_point; return; }
      alert("Não foi possível abrir o pagamento. Tente novamente.");
    } catch {
      alert("Falha ao conectar ao pagamento.");
    } finally {
      setPagando(null);
    }
  }

  async function desbloquear(eventoId: string) {
    setPagando("avulso:" + eventoId);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mp_checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "avulso_evento", email, cerimonial_id: userId, evento_id: eventoId }),
      });
      const d = await r.json();
      if (d.init_point) { window.location.href = d.init_point; return; }
      alert("Não foi possível abrir o pagamento. Tente novamente.");
    } catch {
      alert("Falha ao conectar ao pagamento.");
    } finally {
      setPagando(null);
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center text-gray-500">Carregando…</div>;

  const temPro = eventos.some((e) => e.plano === "pro");
  const mensal = planos.find((p) => p.codigo === "pro_mensal");
  const anual = planos.find((p) => p.codigo === "pro_anual");
  const brl = (v?: number) => (v != null ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">Minha conta</h1>
        <button onClick={sair} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Sair</button>
      </div>
      <p className="mt-1 text-sm text-gray-500">{email}</p>

      {pagamentoOk && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Recebemos seu retorno do pagamento. Assim que o Mercado Pago confirmar, seu plano Pro é liberado automaticamente.
        </div>
      )}

      {/* Plano Pro */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-amber-700">Plano Pro</h2>
          {temPro && <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">Ativo</span>}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Convite personalizado por convidado, múltiplos eventos, disparo automático no WhatsApp e sem anúncios.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => assinar("pro_mensal")}
            disabled={!!pagando}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {pagando === "pro_mensal" ? "Abrindo…" : `Assinar mensal${mensal ? " — " + brl(mensal.valor) + "/mês" : ""}`}
          </button>
          <button
            onClick={() => assinar("pro_anual")}
            disabled={!!pagando}
            className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
          >
            {pagando === "pro_anual" ? "Abrindo…" : `Assinar anual${anual ? " — " + brl(anual.valor) + "/ano" : ""}`}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Pagamento seguro via Mercado Pago. Cancele quando quiser.</p>
      </div>

      <h2 className="mt-8 text-lg font-bold text-green-700">Meus eventos</h2>
      <div className="mt-3 space-y-2">
        {eventos.length ? eventos.map((e) => (
          <div key={e.id} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <a href={`/e/${e.slug}/painel`} className="hover:underline">
                <b className="text-green-700">{e.nome}</b>
                <span className="block text-xs text-gray-500">/e/{e.slug}</span>
              </a>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.plano === "pro" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                {e.plano === "pro" ? "Pro" : "Lite"}
              </span>
            </div>
            {e.plano !== "pro" && (
              <button
                onClick={() => desbloquear(e.id)}
                disabled={!!pagando}
                className="mt-2 text-xs font-semibold text-amber-700 hover:underline disabled:opacity-60"
              >
                {pagando === "avulso:" + e.id ? "Abrindo…" : "Desbloquear Pro só neste evento (avulso)"}
              </button>
            )}
          </div>
        )) : <p className="text-sm text-gray-400">Você ainda não tem eventos.</p>}
      </div>
    </div>
  );
}
