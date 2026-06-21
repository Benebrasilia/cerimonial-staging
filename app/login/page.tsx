"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function traduzErro(m: string) {
  const t = m.toLowerCase();
  if (t.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (t.includes("already registered") || t.includes("already been registered")) return "Esse e-mail já tem uma conta. Tente entrar.";
  if (t.includes("at least 6")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (t.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (t.includes("unable to validate email") || t.includes("invalid email")) return "E-mail inválido.";
  return m;
}

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function googleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/conta` },
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setCarregando(true);
    try {
      if (modo === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: `${window.location.origin}/conta` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/conta");
          return;
        }
        setMsg({ tipo: "ok", texto: "Conta criada! Verifique seu e-mail para confirmar e depois faça login." });
        setModo("entrar");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        router.push("/conta");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : String(err);
      setMsg({ tipo: "erro", texto: traduzErro(m) });
    } finally {
      setCarregando(false);
    }
  }

  async function esqueciSenha() {
    if (!email) {
      setMsg({ tipo: "erro", texto: "Digite seu e-mail acima para receber o link de redefinição." });
      return;
    }
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/conta`,
    });
    setMsg(
      error
        ? { tipo: "erro", texto: traduzErro(error.message) }
        : { tipo: "ok", texto: "Enviamos um link para redefinir sua senha (verifique o e-mail)." }
    );
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-green-700">
          Confirma<span className="text-amber-500">e</span>
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          {modo === "entrar" ? "Entre para gerenciar seus eventos" : "Crie sua conta gratuita"}
        </p>

        <form onSubmit={enviar} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500"
          />
          <input
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500"
          />

          {msg && (
            <p className={`text-sm ${msg.tipo === "erro" ? "text-red-600" : "text-green-700"}`}>{msg.texto}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        {modo === "entrar" && (
          <button onClick={esqueciSenha} className="mt-2 w-full text-center text-xs text-gray-500 hover:text-gray-700">
            Esqueci minha senha
          </button>
        )}

        <p className="mt-3 text-center text-sm text-gray-600">
          {modo === "entrar" ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => {
              setModo(modo === "entrar" ? "criar" : "entrar");
              setMsg(null);
            }}
            className="font-semibold text-green-700 hover:underline"
          >
            {modo === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={googleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7C43.6 37.9 46.1 31.8 46.1 24.5z"/><path fill="#FBBC05" d="M10.3 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.7 2.3-6.4 0-11.8-3.7-13.7-9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
