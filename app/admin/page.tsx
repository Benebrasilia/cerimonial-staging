"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

type Evento = {
  id: string;
  nome: string;
  slug: string;
  data: string | null;
  horario: string | null;
  local: string | null;
};

function slugify(s: string) {
  return (
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "evento"
  );
}

function traduz(m: string) {
  if (/Invalid login/i.test(m)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(m)) return "Esse e-mail já tem conta. Tente entrar.";
  if (/at least 6/i.test(m)) return "A senha precisa ter ao menos 6 caracteres.";
  if (/Email not confirmed/i.test(m)) return "Confirme seu e-mail antes de entrar.";
  return m;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (carregando) {
    return <div className="grid min-h-screen place-items-center text-gray-500">Carregando…</div>;
  }
  return session ? <Painel email={session.user.email ?? ""} /> : <Auth />;
}

function Auth() {
  const [modo, setModo] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<{ t: string; tipo: "ok" | "err" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function oauth(provider: "google" | "apple") {
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setMsg({ t: traduz(error.message), tipo: "err" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email || !senha) return setMsg({ t: "Preencha e-mail e senha.", tipo: "err" });
    setBusy(true);
    try {
      if (modo === "up") {
        const { error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        setMsg({ t: "Conta criada! Se pedir confirmação por e-mail, confirme e depois entre.", tipo: "ok" });
        setModo("in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
    } catch (err) {
      setMsg({ t: traduz((err as Error).message), tipo: "err" });
    }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-green-700">Confirma<span className="text-amber-500">e</span></h1>
        <p className="mb-5 text-center text-sm text-gray-500">Gestor de eventos</p>
        <label className="mb-1 block text-sm font-medium">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
        />
        <label className="mb-1 block text-sm font-medium">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {modo === "in" ? "Entrar" : "Criar conta"}
        </button>
        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" /> ou <span className="h-px flex-1 bg-gray-200" />
        </div>
        <button type="button" onClick={() => oauth("google")} className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 hover:bg-gray-50">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          Continuar com Google
        </button>
        <button type="button" onClick={() => oauth("apple")} className="mb-1 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 font-medium text-white hover:bg-gray-900">
          <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          Continuar com Apple
        </button>
        <p className="mt-3 text-center text-sm text-gray-600">
          {modo === "in" ? "Não tem conta? " : "Já tem conta? "}
          <button
            type="button"
            onClick={() => { setModo(modo === "in" ? "up" : "in"); setMsg(null); }}
            className="font-semibold text-green-700"
          >
            {modo === "in" ? "Criar conta" : "Entrar"}
          </button>
        </p>
        {msg && (
          <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.tipo === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {msg.t}
          </p>
        )}
      </form>
    </div>
  );
}

function Painel({ email }: { email: string }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ehAdmin, setEhAdmin] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<Evento | null | undefined>(undefined); // undefined=fechado, null=novo

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setErro(error.message);
    else setEventos((data as Evento[]) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { supabase.rpc("is_admin").then(({ data }) => setEhAdmin(data === true), () => {}); }, []);

  async function excluir(ev: Evento) {
    if (!confirm(`Excluir o evento "${ev.nome}"?\nIsso apaga também as confirmações dele. Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("eventos").delete().eq("id", ev.id);
    if (error) return alert("Erro ao excluir: " + error.message);
    carregar();
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between bg-green-700 px-5 py-3 text-white">
        <div className="font-bold">
          ✦ Confirmae <span className="text-sm font-normal opacity-80">· gestor de eventos</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="opacity-90">{email}</span>
          {ehAdmin && (
            <a href="/sistema" className="rounded-md border border-white/40 px-3 py-1 hover:bg-white/10">
              Sistema
            </a>
          )}
          <a href="/conta?ver=1" className="rounded-md border border-white/40 px-3 py-1 hover:bg-white/10">
            Planos
          </a>
          <button onClick={() => supabase.auth.signOut()} className="rounded-md border border-white/40 px-3 py-1 hover:bg-white/10">
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-700">Meus eventos</h2>
          <button onClick={() => setEditando(null)} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
            + Novo evento
          </button>
        </div>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Erro: {erro}</p>}
        {carregando ? (
          <p className="text-center text-gray-500">Carregando…</p>
        ) : eventos.length === 0 ? (
          <p className="text-center text-gray-500">
            Você ainda não tem eventos. Clique em <b>+ Novo evento</b> para criar o primeiro. 🎉
          </p>
        ) : (
          <ul className="space-y-3">
            {eventos.map((ev) => {
              const dataFmt = ev.data ? new Date(ev.data + "T00:00:00").toLocaleDateString("pt-BR") : "sem data";
              const link = typeof window !== "undefined" ? `${window.location.origin}/e/${ev.slug}` : `/e/${ev.slug}`;
              return (
                <li key={ev.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <div className="font-semibold">{ev.nome}</div>
                    <div className="text-sm text-gray-500">
                      📅 {dataFmt}{ev.horario ? ` · ${ev.horario}` : ""}{ev.local ? ` · ${ev.local}` : ""}
                    </div>
                    <div className="truncate text-sm">
                      <a href={link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">🔗 {link}</a>
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 gap-2">
                    <a href={`/e/${ev.slug}/painel`} className="rounded-md bg-green-700 px-3 py-1 text-sm font-semibold text-white hover:bg-green-800">
                      Detalhes
                    </a>
                    <button onClick={() => setEditando(ev)} className="rounded-md border border-green-600 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-50">
                      Editar
                    </button>
                    <button onClick={() => excluir(ev)} className="rounded-md border border-red-400 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50">
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">Ambiente de staging · dados isolados da produção</p>
      </main>

      {editando !== undefined && (
        <ModalEvento ev={editando} onClose={() => setEditando(undefined)} onSaved={() => { setEditando(undefined); carregar(); }} />
      )}
    </div>
  );
}

function ModalEvento({ ev, onClose, onSaved }: { ev: Evento | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(ev?.nome ?? "");
  const [data, setData] = useState(ev?.data ?? "");
  const [horario, setHorario] = useState(ev?.horario ?? "");
  const [local, setLocal] = useState(ev?.local ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setMsg("Dê um nome ao evento.");
    setBusy(true);
    const payload = { nome: nome.trim(), data: data || null, horario: horario.trim(), local: local.trim() || null };
    let error;
    if (ev) {
      ({ error } = await supabase.from("eventos").update(payload).eq("id", ev.id));
    } else {
      ({ error } = await supabase.from("eventos").insert({ ...payload, slug: slugify(nome) + "-" + Math.random().toString(36).slice(2, 6) }));
    }
    setBusy(false);
    if (error) return setMsg(error.message);
    onSaved();
  }

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40 px-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={salvar} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-green-700">{ev ? "Editar evento" : "Novo evento"}</h3>
        <label className="mb-1 block text-sm font-medium">Nome do evento *</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Arraiá rumo ao Hexa" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600" />
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Data</label>
            <input type="date" value={data ?? ""} onChange={(e) => setData(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Horário (opcional)</label>
            <input value={horario ?? ""} onChange={(e) => setHorario(e.target.value)} placeholder="ex: 16h" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600" />
          </div>
        </div>
        <label className="mb-1 block text-sm font-medium">Local</label>
        <input value={local ?? ""} onChange={(e) => setLocal(e.target.value)} placeholder="Endereço do evento" className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600" />
        {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-green-600 py-2.5 font-semibold text-green-700 hover:bg-green-50">Cancelar</button>
          <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-60">Salvar</button>
        </div>
      </form>
    </div>
  );
}
