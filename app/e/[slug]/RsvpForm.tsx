"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatarData, type EventoPublico } from "@/lib/eventoPublico";

const supabase = createClient();
const words = (s: string) => (s || "").trim().split(/\s+/).filter(Boolean);

type Crianca = { nome: string; idade: string };

export default function RsvpForm({ evento }: { evento: EventoPublico }) {
  const [pos, setPos] = useState(0);
  const [nome, setNome] = useState("");
  const [vai, setVai] = useState<boolean | null>(null);
  const [adultos, setAdultos] = useState<string[]>([""]);
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const temRecado = evento.ultimo_passo !== false;
  const fluxo = useMemo(() => {
    if (vai === true) return ["adultos", "criancas", ...(temRecado ? ["recado"] : [])];
    if (vai === false) return [...(temRecado ? ["recado"] : [])];
    return [];
  }, [vai, temRecado]);

  // pos 0 = nome; pos 1.. = fluxo[pos-1]
  const passo = pos === 0 ? "nome" : fluxo[pos - 1];
  const ultimoPasso = pos > 0 && pos - 1 === fluxo.length - 1;

  function escolher(quer: boolean) {
    if (words(nome).length < 2) { setErro(nome ? "Coloque também o sobrenome." : "Por favor, preencha seu nome."); return; }
    setErro("");
    setVai(quer);
    if (quer) setAdultos((a) => { const c = [...a]; c[0] = nome.trim(); return c; });
    const novoFluxo = quer ? ["adultos", "criancas", ...(temRecado ? ["recado"] : [])] : [...(temRecado ? ["recado"] : [])];
    if (novoFluxo.length === 0) enviar(quer);
    else setPos(1);
  }

  function validar(): boolean {
    if (passo === "adultos") {
      const ok = adultos.every((a) => words(a).length >= 2);
      if (!ok) setErro("Coloque nome e sobrenome de cada adulto.");
      return ok;
    }
    if (passo === "criancas") {
      const ok = criancas.every((c) => words(c.nome).length >= 2);
      if (!ok) setErro("Coloque nome e sobrenome de cada criança.");
      return ok;
    }
    return true;
  }

  function avancar() {
    if (!validar()) return;
    setErro("");
    if (ultimoPasso) { enviar(vai === true); return; }
    setPos((p) => p + 1);
  }
  function voltar() { setErro(""); setPos((p) => Math.max(0, p - 1)); }

  async function enviar(quer: boolean) {
    setEnviando(true); setErro("");
    const adStr = quer ? adultos.map((a) => a.trim()).filter(Boolean).join(", ") : "";
    const crStr = quer ? criancas.map((c) => c.nome.trim() + (c.idade ? ` (${c.idade} anos)` : "")).filter(Boolean).join(", ") : "";
    const { error } = await supabase.from("confirmacoes").insert({
      evento_id: evento.id,
      nome: nome.trim(),
      presenca: quer ? "Sim" : "Não",
      num_adultos: quer ? adultos.length : null,
      adultos: adStr || null,
      num_criancas: quer ? criancas.length : null,
      criancas: crStr || null,
      mensagem: mensagem.trim() || null,
    });
    setEnviando(false);
    if (error) { setErro("Não foi possível enviar: " + error.message); return; }
    setEnviado(true);
  }

  const dataFmt = formatarData(evento.data);

  if (enviado) {
    return (
      <Tela>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-700">Obrigado!</div>
          <div className="mt-1 text-lg text-gray-500">{vai ? "presença confirmada" : "resposta registrada"}</div>
          {vai ? (
            <>
              <p className="mt-4 text-gray-700">A gente se vê{dataFmt ? ` dia ${dataFmt}` : ""}! 🎉</p>
              {evento.local && <p className="mt-2 font-semibold text-green-700">📍 {evento.local}</p>}
            </>
          ) : (
            <p className="mt-4 text-gray-700">Que pena! Fica para uma próxima. Obrigado por avisar 💚</p>
          )}
        </div>
      </Tela>
    );
  }

  return (
    <Tela>
      {/* cabeçalho do evento */}
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-bold text-green-700">{evento.nome}</h1>
        <div className="mt-2 inline-block rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-amber-200">
          {dataFmt || "Data a confirmar"}
        </div>
        {evento.horario && <div className="mt-1 text-sm italic text-gray-600">{evento.horario}</div>}
        {evento.local && <div className="mt-1 text-sm font-semibold text-green-700">📍 {evento.local}</div>}
      </div>

      <div className="border-t border-gray-200 pt-5">
        {passo === "nome" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Pra começar, qual é o seu nome completo?</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
            {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => escolher(true)} className="flex-1 rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800">Eu vou! 🎉</button>
              <button onClick={() => escolher(false)} className="flex-1 rounded-lg border border-green-600 bg-white py-3 font-semibold text-green-700 hover:bg-green-50">Não vou poder 😢</button>
            </div>
          </div>
        )}

        {passo === "adultos" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Quantos adultos vão? (incluindo você)</label>
            <select value={adultos.length} onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setAdultos((prev) => Array.from({ length: n }, (_, i) => i === 0 ? (prev[0] || nome.trim()) : (prev[i] || "")));
            }} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {adultos.map((a, i) => (
              <input key={i} value={a} onChange={(e) => setAdultos((prev) => prev.map((v, k) => k === i ? e.target.value : v))}
                placeholder={`Adulto ${i + 1}${i === 0 ? " (você)" : ""} — nome e sobrenome`}
                className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
            ))}
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <Navegacao onBack={voltar} onNext={avancar} ultimo={ultimoPasso} vai={vai} enviando={enviando} />
          </div>
        )}

        {passo === "criancas" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Quantas crianças vão? (até 12 anos)</label>
            <select value={criancas.length} onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setCriancas((prev) => Array.from({ length: n }, (_, i) => prev[i] || { nome: "", idade: "" }));
            }} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600">
              {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {criancas.map((c, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input value={c.nome} onChange={(e) => setCriancas((prev) => prev.map((v, k) => k === i ? { ...v, nome: e.target.value } : v))}
                  placeholder={`Criança ${i + 1} — nome e sobrenome`}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
                <select value={c.idade} onChange={(e) => setCriancas((prev) => prev.map((v, k) => k === i ? { ...v, idade: e.target.value } : v))}
                  className="w-24 rounded-lg border border-gray-300 px-2 py-2.5 outline-none focus:border-green-600">
                  <option value="">Idade</option>
                  {Array.from({ length: 12 }, (_, a) => a + 1).map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            ))}
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <Navegacao onBack={voltar} onNext={avancar} ultimo={ultimoPasso} vai={vai} enviando={enviando} />
          </div>
        )}

        {passo === "recado" && (
          <div>
            <label className="mb-1 block text-sm font-medium">{vai ? "Deixe um recado/grito (opcional)" : "Deixa um recado mesmo assim (opcional)"}</label>
            <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3}
              placeholder="Escreva aqui…"
              className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <Navegacao onBack={voltar} onNext={avancar} ultimo={ultimoPasso} vai={vai} enviando={enviando} />
          </div>
        )}
      </div>
    </Tela>
  );
}

function Tela({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}

function Navegacao({ onBack, onNext, ultimo, vai, enviando }: {
  onBack: () => void; onNext: () => void; ultimo: boolean; vai: boolean | null; enviando: boolean;
}) {
  return (
    <div className="mt-4 flex gap-3">
      <button onClick={onBack} className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-50">←</button>
      <button onClick={onNext} disabled={enviando}
        className="flex-1 rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-60">
        {enviando ? "Enviando…" : ultimo ? (vai ? "Confirmar presença 🎉" : "Enviar resposta") : "Continuar"}
      </button>
    </div>
  );
}
