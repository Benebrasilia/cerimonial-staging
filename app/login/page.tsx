"use client";

import { createClient } from "@/lib/supabase";

export default function Login() {
  const supabase = createClient();
  async function googleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/conta` },
    });
  }
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-green-700">Confirma<span className="text-amber-500">e</span></h1>
        <p className="mt-1 text-sm text-gray-500">Entre para gerenciar seus eventos</p>
        <button onClick={googleLogin}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 font-semibold text-gray-700 hover:bg-gray-50">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7C43.6 37.9 46.1 31.8 46.1 24.5z"/><path fill="#FBBC05" d="M10.3 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.7 2.3-6.4 0-11.8-3.7-13.7-9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
