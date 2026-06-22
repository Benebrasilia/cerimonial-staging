"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

type Row = {
  id: string; ts: number; nome: string; presenca: string;
  na: number | null; adultos: string | null; nc: number | null; criancas: string | null;
  mensagem: string | null; foto: string | null; prev: string | null;
};
type Dados = { ok?: boolean; error?: string; horario?: string; ultimo_passo?: boolean; visitas?: { total: number; unicos: number }; report_ativo?: boolean; report_horarios?: string; report_dias?: string; plano?: string; convite_imagem_url?: string | null; rows?: Row[] };
type ConvRow = { id: string; token: string; nome: string; telefone: string | null; num_adultos: number; num_criancas: number; respondido: boolean; presenca: string | null };
type AnuncioP = { id: string; tipo: string; titulo: string | null; midia_url: string | null; link: string | null };

const norm = (s: string) => (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const toks = (s: string) => norm(s).split(" ").filter(Boolean);
function same(a: string, b: string) {
  const ta = toks(a), tb = toks(b);
  if (!ta.length || !tb.length) return false;
  if (ta[0] !== tb[0]) return false;
  const sa = ta.slice(1), sb = tb.slice(1);
  if (!sa.length || !sb.length) return norm(a) === norm(b);
  for (const x of sa) if (sb.includes(x)) return true;
  return false;
}
function imgUrl(u: string | null): string {
  if (!u) return "";
  const m = String(u).match(/[-\w]{25,}/);
  return m ? `https://drive.google.com/thumbnail?id=${m[0]}&sz=w600` : u;
}

type USet = { name: string; disp: string; src: string[] };
function addU(set: USet[], name: string, src: string, disp?: string) {
  for (const e of set) { if (same(e.name, name)) { if (!e.src.includes(src)) e.src.push(src); return; } }
  set.push({ name, disp: disp || name, src: [src] });
}

function computar(rows: Row[]) {
  const ordered = [...rows].sort((a, b) => a.ts - b.ts);
  const ppl: Row[] = [];
  for (const r of ordered) {
    let idx = -1;
    for (let i = 0; i < ppl.length; i++) { if (same(ppl[i].nome, r.nome) || (r.prev && same(ppl[i].nome, r.prev))) { idx = i; break; } }
    if (idx >= 0) ppl[idx] = r; else ppl.push(r);
  }
  const adultSet: USet[] = [], childSet: USet[] = [];
  let unAd = 0, unCr = 0;
  const naoVai: string[] = [], msgVai: Row[] = [], msgNao: Row[] = [];
  const ageCount: Record<string, number> = {};
  for (const p of ppl) {
    if ((p.presenca || "").indexOf("Sim") === 0) {
      const an = (p.adultos || "").split(",").map((s) => s.trim()).filter(Boolean);
      const cn = (p.criancas || "").split(",").map((s) => s.trim()).filter(Boolean);
      an.forEach((n) => addU(adultSet, n, p.nome, n));
      cn.forEach((n) => { const base = n.replace(/\s*\(.*\)\s*$/, "").trim(); addU(childSet, base, p.nome, n); const mm = n.match(/\((\d+)/); const a = mm ? mm[1] : "?"; ageCount[a] = (ageCount[a] || 0) + 1; });
      unAd += Math.max(0, (p.na || 0) - an.length);
      unCr += Math.max(0, (p.nc || 0) - cn.length);
      if ((p.mensagem || "").trim() || p.foto) msgVai.push(p);
    } else if ((p.presenca || "").indexOf("N") === 0) {
      naoVai.push(p.nome);
      if ((p.mensagem || "").trim() || p.foto) msgNao.push(p);
    }
  }
  const totalAd = adultSet.length + unAd, totalCr = childSet.length + unCr;
  const ageKeys = Object.keys(ageCount).sort((a, b) => a === "?" ? 1 : b === "?" ? -1 : Number(a) - Number(b));
  const ageStr = ageKeys.map((a) => (a === "?" ? "sem idade" : a + (a === "1" ? " ano" : " anos")) + ": " + ageCount[a]).join(" · ");
  return { totalAd, totalCr, unAd, unCr, adultSet, childSet, naoVai, msgVai, msgNao, ageStr };
}

export default function Painel({ slug }: { slug: string }) {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [hInput, setHInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [convs, setConvs] = useState<ConvRow[]>([]);
  const [travados, setTravados] = useState(false);
  const [cNome, setCNome] = useState(""); const [cTel, setCTel] = useState(""); const [cNa, setCNa] = useState(2); const [cNc, setCNc] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [eNome, setENome] = useState(""); const [eTel, setETel] = useState(""); const [eNa, setENa] = useState(1); const [eNc, setENc] = useState(0);
  const [agAtivo, setAgAtivo] = useState(false);
  const [agHorarios, setAgHorarios] = useState<string[]>([]);
  const [agDias, setAgDias] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [novaHora, setNovaHora] = useState("12:00");
  const [imgBusy, setImgBusy] = useState(false);
  const [adsP, setAdsP] = useState<AnuncioP[]>([]);
  const [tentouDono, setTentouDono] = useState(false);
  useEffect(() => {
    supabase.from("anuncios").select("id,tipo,titulo,midia_url,link").eq("ativo", true).in("posicao", ["painel", "ambos"]).order("ordem")
      .then(({ data }) => { if (data) setAdsP(data as AnuncioP[]); }, () => {});
  }, []);

  // Dono autenticado entra direto no proprio evento (sem senha). Senha continua p/ co-organizadores.
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const ok = await carregar("");
        if (ok) { setAuthed(true); await loadConvidados(""); }
        else setErro("");
      }
      setTentouDono(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = data?.rows || [];
  const stats = useMemo(() => computar(rows), [rows]);

  async function carregar(senha: string) {
    const { data: d, error } = await supabase.rpc("painel_dados", { p_slug: slug, p_pwd: senha });
    if (error || !d || (d as Dados).error) { setErro("Senha incorreta."); return false; }
    const dd = d as Dados;
    setData(dd); setHInput(dd.horario || "");
    setAgAtivo(!!dd.report_ativo);
    setAgHorarios((dd.report_horarios || "").split(",").map((x) => x.trim()).filter(Boolean));
    setAgDias((dd.report_dias || "").split(",").map((x) => parseInt(x, 10)).filter((x) => !isNaN(x)));
    setErro(""); return true;
  }
  async function entrar() {
    setErro("");
    const ok = await carregar(pwd);
    if (ok) { setAuthed(true); await loadConvidados(pwd); }
  }
  async function recarregar() { if (authed) { await carregar(pwd); await loadConvidados(pwd); } }

  async function loadConvidados(senha: string) {
    const { data } = await supabase.rpc("painel_convidados", { p_slug: slug, p_pwd: senha });
    const d = data as { ok?: boolean; travados?: boolean; convidados?: ConvRow[] } | null;
    if (d && d.ok) { setConvs(d.convidados || []); setTravados(!!d.travados); }
  }
  function linkDe(token: string) { return `${typeof window !== "undefined" ? window.location.origin : ""}/e/${slug}?c=${token}`; }
  function waDe(c: ConvRow) {
    const tel = (c.telefone || "").replace(/\D/g, "");
    const full = tel.startsWith("55") ? tel : "55" + tel;
    const msg = `🇧🇷 Oi, ${c.nome}! Você é meu convidado pro Arraiá rumo ao Hexa! Confirme sua presença (já no seu nome): ${linkDe(c.token)}`;
    return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
  }
  function copiar(token: string) { try { navigator.clipboard?.writeText(linkDe(token)); alert("Link copiado!"); } catch { alert(linkDe(token)); } }
  async function addConvidado() {
    if (!cNome.trim()) { alert("Coloque o nome do convidado."); return; }
    await supabase.rpc("painel_convidado_add", { p_slug: slug, p_pwd: pwd, p_nome: cNome, p_tel: cTel, p_na: cNa, p_nc: cNc });
    setCNome(""); setCTel(""); await loadConvidados(pwd);
  }
  async function delConvidado(id: string, nome: string) { if (!confirm(`Remover convidado ${nome}?`)) return; await supabase.rpc("painel_convidado_del", { p_slug: slug, p_pwd: pwd, p_id: id }); await loadConvidados(pwd); }
  function iniciarEdicao(c: ConvRow) { setEditId(c.id); setENome(c.nome); setETel(c.telefone || ""); setENa(c.num_adultos); setENc(c.num_criancas); }
  async function salvarEdicao(id: string) { await supabase.rpc("painel_convidado_upd", { p_slug: slug, p_pwd: pwd, p_id: id, p_nome: eNome, p_tel: eTel, p_na: eNa, p_nc: eNc }); setEditId(null); await loadConvidados(pwd); }
  async function toggleTravado(v: boolean) { await supabase.rpc("painel_set_travado", { p_slug: slug, p_pwd: pwd, p_val: v }); setTravados(v); }
  function toggleDia(d: number) { setAgDias((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d].sort((a, b) => a - b)); }
  function addHora() { const h = novaHora.trim(); if (/^\d{1,2}:\d{2}$/.test(h) && !agHorarios.includes(h)) setAgHorarios((p) => [...p, h].sort()); }
  function rmHora(h: string) { setAgHorarios((p) => p.filter((x) => x !== h)); }
  async function uploadConvite(file: File | null) {
    if (!file) return;
    setImgBusy(true);
    try {
      const ext = ((file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")) || "jpg";
      const path = `convites/${slug}_${Date.now()}.${ext}`;
      const up = await supabase.storage.from("fotos").upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
      if (!up.error) {
        const { data: pub } = supabase.storage.from("fotos").getPublicUrl(path);
        await supabase.rpc("painel_set_convite_imagem", { p_slug: slug, p_pwd: pwd, p_url: pub.publicUrl });
        await recarregar();
      }
    } catch { /* ignora */ }
    setImgBusy(false);
  }
  async function salvarAgenda() {
    setBusy(true);
    await supabase.rpc("painel_set_agenda", { p_slug: slug, p_pwd: pwd, p_ativo: agAtivo, p_horarios: agHorarios.join(","), p_dias: agDias.join(",") });
    await recarregar(); setBusy(false); alert("Agenda salva!");
  }
  async function salvarHorario(valor: string) {
    setBusy(true);
    await supabase.rpc("painel_set_config", { p_slug: slug, p_pwd: pwd, p_horario: valor, p_ultimo_passo: null });
    await recarregar(); setBusy(false);
  }
  async function toggleUltimo(v: boolean) {
    setBusy(true);
    await supabase.rpc("painel_set_config", { p_slug: slug, p_pwd: pwd, p_horario: null, p_ultimo_passo: v });
    await recarregar(); setBusy(false);
  }
  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir a resposta de ${nome}? Isso remove a submissão inteira.`)) return;
    await supabase.rpc("painel_excluir", { p_slug: slug, p_pwd: pwd, p_id: id });
    await recarregar();
  }
  async function enviarEmail() {
    setEnviandoEmail(true);
    const { data: r, error } = await supabase.functions.invoke("relatorio", { body: { slug, pwd } });
    setEnviandoEmail(false);
    const err = error?.message || (r && (r as { error?: string }).error);
    alert(err ? "Não consegui enviar: " + err : "Relatório enviado por e-mail! 📧");
  }
  function megaCartaz() {
    const bloco = (titulo: string, arr: Row[]) => {
      let s = `=== ${titulo} ===\n`;
      if (!arr.length) s += "(nenhum recado ainda)\n";
      else arr.forEach((m, i) => { s += `${i + 1}) ${m.nome}\n   Foto: ${m.foto ? imgUrl(m.foto) : "(sem foto)"}\n   Mensagem: ${(m.mensagem || "").trim() ? '"' + m.mensagem + '"' : "(só foto)"}\n`; });
      return s + "\n";
    };
    let p = 'Crie um MEGA CARTAZ / mosaico de torcida para um telão (tema arraiá + cores do Brasil). Título: "FORÇA, BRASIL — RUMO AO HEXA!". Um card por torcedor com a FOTO e a MENSAGEM.\n\n';
    p += bloco("TORCEDORES PRESENTES (quem vai)", stats.msgVai);
    p += bloco("TORCENDO DE LONGE (quem não vai)", stats.msgNao);
    const blob = new Blob([p], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "prompt-mega-cartaz.txt"; a.click();
  }

  if (!authed) {
    if (!tentouDono) {
      return <div className="grid min-h-screen place-items-center text-gray-500">Carregando…</div>;
    }
    return (
      <div className="grid min-h-screen place-items-center bg-stone-100 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-green-700">Painel dos organizadores</h1>
          <p className="mt-1 text-sm text-gray-500">{slug}</p>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()}
            placeholder="Senha" className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
          <button onClick={entrar} className="mt-3 w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800">Entrar</button>
          {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
        </div>
      </div>
    );
  }

  const v = data?.visitas;
  const Grid = ({ items }: { items: string[] }) => items.length ? (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm sm:grid-cols-3">
      {items.map((t, i) => <div key={i} className="border-b border-dotted border-stone-200 py-0.5"><span className="mr-1 font-bold text-gray-400">{i + 1}.</span>{t}</div>)}
    </div>
  ) : <span className="text-gray-400">—</span>;

  const Msgs = ({ arr }: { arr: Row[] }) => arr.length ? (
    <div className="space-y-2">
      {arr.map((m) => (
        <div key={m.id} className="overflow-hidden rounded border-l-4 border-amber-500 bg-amber-50 p-2 text-sm">
          {m.foto && <a href={imgUrl(m.foto)} target="_blank" rel="noreferrer"><img src={imgUrl(m.foto)} referrerPolicy="no-referrer" className="float-left mr-3 mb-1 max-w-[90px] rounded" alt="" /></a>}
          <b>{m.nome}:</b> {(m.mensagem || "").trim() ? `"${m.mensagem}"` : <i className="text-gray-500">(só foto)</i>}
          <div className="clear-both" />
        </div>
      ))}
    </div>
  ) : <span className="text-gray-400">—</span>;

  return (
    <div className="mx-auto max-w-3xl px-3 py-6">
      <div className="rounded-t-xl bg-green-700 p-4 text-center text-amber-50">
        <h1 className="text-xl font-bold">⚽ Arraiá rumo ao Hexa 🏆</h1>
        <div className="text-xs opacity-90">Painel de confirmações</div>
      </div>
      <div className="rounded-b-xl border border-t-0 bg-white p-5">
        <div className="flex gap-2">
          {[["Adultos", stats.totalAd, "text-green-700"], ["Crianças", stats.totalCr, "text-amber-600"], ["Total pessoas", stats.totalAd + stats.totalCr, "text-orange-700"]].map(([l, n, c]) => (
            <div key={l as string} className="flex-1 rounded-lg bg-stone-50 p-3 text-center">
              <div className={`text-3xl font-bold ${c}`}>{n as number}</div>
              <div className="text-xs text-gray-500">{l as string}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-center text-sm text-slate-700">
          👀 Visitas ao convite: <b className="text-green-700">{v?.unicos ?? "—"}</b> únicos · <b>{v?.total ?? "—"}</b> no total
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">Plano deste evento: <b className={data?.plano === "pro" ? "text-green-700" : "text-gray-700"}>{data?.plano === "pro" ? "Pro" : "Lite"}</b></div>

        <div className="mt-3 rounded-lg border bg-stone-50 p-3">
          <div className="text-sm font-medium">🖼️ Imagem do convite {data?.plano !== "pro" && <span className="text-xs font-normal text-gray-500">(usada no plano Lite)</span>}</div>
          {data?.plano === "pro"
            ? <p className="mt-1 text-xs text-gray-500">Seu plano é Pro: o convite usa o tema personalizado. (A imagem só é usada no plano Lite.)</p>
            : <p className="mt-1 text-xs text-gray-500">No plano Lite, o convite é a imagem que você enviar aqui (faça a arte onde quiser e suba o JPG/PNG).</p>}
          {data?.convite_imagem_url && <img src={data.convite_imagem_url} alt="convite" className="mt-2 max-h-40 rounded-lg border" />}
          <input type="file" accept="image/*" disabled={imgBusy} onChange={(e) => uploadConvite(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
          {imgBusy && <p className="mt-1 text-xs text-gray-500">Enviando…</p>}
        </div>

        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="mb-2 text-sm">⏰ <b>Horário do jogo:</b> {data?.horario?.trim() ? data.horario : "a confirmar (mostrando SAVE THE DATE)"}</div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={hInput} onChange={(e) => setHInput(e.target.value)} placeholder="ex: 16h" className="min-w-[120px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600" />
            <button disabled={busy} onClick={() => salvarHorario(hInput)} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirmar horário</button>
            <button disabled={busy} onClick={() => { setHInput(""); salvarHorario(""); }} className="rounded-lg border border-orange-400 px-3 py-2 text-sm text-orange-700">Voltar p/ Save the Date</button>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="mb-2 text-sm">🎤 <b>Último passo (grito + foto pro telão):</b> {data?.ultimo_passo ? "ativado" : "DESATIVADO"}</div>
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => toggleUltimo(true)} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Ativar</button>
            <button disabled={busy} onClick={() => toggleUltimo(false)} className="rounded-lg border border-orange-400 px-3 py-2 text-sm text-orange-700">Desativar</button>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={agAtivo} onChange={(e) => setAgAtivo(e.target.checked)} />
            📅 Enviar relatório automático por e-mail
          </label>
          <div className={agAtivo ? "mt-2" : "mt-2 pointer-events-none opacity-50"}>
            <div className="text-xs text-gray-600">Dias da semana:</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((lbl, i) => (
                <button key={i} type="button" onClick={() => toggleDia(i)} className={`rounded-lg px-2.5 py-1 text-xs ${agDias.includes(i) ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-600"}`}>{lbl}</button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">Horários:</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {agHorarios.map((h) => (
                <span key={h} className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-xs">{h}<button type="button" onClick={() => rmHora(h)} className="text-orange-600">✕</button></span>
              ))}
              <input type="time" value={novaHora} onChange={(e) => setNovaHora(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs" />
              <button type="button" onClick={addHora} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">+ adicionar</button>
            </div>
          </div>
          <button disabled={busy} onClick={salvarAgenda} className="mt-3 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Salvar agenda</button>
          <p className="mt-2 text-xs text-gray-500">Fuso de Brasília. Começa a enviar quando o domínio do remetente estiver verificado.</p>
        </div>

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-green-700">📨 Convidados ({convs.length})</h2>
        <label className="mt-1 flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={travados} onChange={(e) => toggleTravado(e.target.checked)} />
          Travar as quantidades (o convidado não altera adultos/crianças)
        </label>
        <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border bg-stone-50 p-3">
          <div className="min-w-[140px] flex-1"><label className="text-xs text-gray-500">Nome</label><input value={cNome} onChange={(e) => setCNome(e.target.value)} placeholder="Nome do convidado" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
          <div className="min-w-[130px]"><label className="text-xs text-gray-500">WhatsApp (DDD)</label><input value={cTel} onChange={(e) => setCTel(e.target.value)} placeholder="61 99999-9999" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
          <div><label className="block text-xs text-gray-500">Adultos</label><select value={cNa} onChange={(e) => setCNa(parseInt(e.target.value, 10))} className="rounded border border-gray-300 px-2 py-1.5 text-sm">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label className="block text-xs text-gray-500">Crianças</label><select value={cNc} onChange={(e) => setCNc(parseInt(e.target.value, 10))} className="rounded border border-gray-300 px-2 py-1.5 text-sm">{[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <button onClick={addConvidado} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white">Adicionar</button>
        </div>
        <div className="mt-2 space-y-1.5">
          {convs.map((c) => (
            <div key={c.id} className="rounded-lg border bg-white px-3 py-2 text-sm">
              {editId === c.id ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[130px] flex-1"><label className="block text-xs text-gray-500">Nome</label><input value={eNome} onChange={(e) => setENome(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                  <div className="min-w-[130px] flex-1"><label className="block text-xs text-gray-500">WhatsApp (DDD)</label><input value={eTel} onChange={(e) => setETel(e.target.value)} placeholder="61 99999-9999" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                  <div><label className="block text-xs text-gray-500">Ad.</label><input type="number" min={1} value={eNa} onChange={(e) => setENa(parseInt(e.target.value) || 1)} className="w-14 rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                  <div><label className="block text-xs text-gray-500">Cr.</label><input type="number" min={0} value={eNc} onChange={(e) => setENc(parseInt(e.target.value) || 0)} className="w-14 rounded border border-gray-300 px-2 py-1.5 text-sm" /></div>
                  <button onClick={() => salvarEdicao(c.id)} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white">Salvar</button>
                  <button onClick={() => setEditId(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs">Cancelar</button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-[150px]">
                    <b>{c.nome}</b> <span className="text-xs text-gray-400">({c.num_adultos}A{c.num_criancas > 0 ? ` · ${c.num_criancas}C` : ""})</span>
                    {!c.telefone && <span className="ml-1 text-xs text-amber-600">· sem telefone</span>}<br />
                    {c.respondido ? <span className="text-xs text-green-700">✅ respondeu{c.presenca ? ` (${(c.presenca || "").indexOf("Sim") === 0 ? "vai" : "não vai"})` : ""}</span> : <span className="text-xs text-orange-600">⏳ pendente</span>}
                  </div>
                  <div className="flex flex-none gap-1.5">
                    {c.telefone && <a href={waDe(c)} target="_blank" rel="noreferrer" className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white">WhatsApp</a>}
                    <button onClick={() => iniciarEdicao(c)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs">editar</button>
                    <button onClick={() => copiar(c.token)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs">copiar link</button>
                    <button onClick={() => delConvidado(c.id, c.nome)} className="rounded-lg border border-orange-400 px-2.5 py-1.5 text-xs text-orange-700">remover</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!convs.length && <p className="text-sm text-gray-400">Nenhum convidado cadastrado ainda.</p>}
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-3">
          <div className="text-sm font-medium">🤖 Disparo automático no WhatsApp {data?.plano !== "pro" && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">🔒 Pro</span>}</div>
          {data?.plano === "pro"
            ? <p className="mt-1 text-xs text-gray-500">Disponível no seu plano. Integração com a WhatsApp Cloud API — configuração em breve.</p>
            : <p className="mt-1 text-xs text-gray-500">Envie os convites automaticamente para toda a lista. Disponível no plano <b>Pro</b>. No Lite, use o botão <b>WhatsApp</b> de cada convidado (1 toque).</p>}
        </div>

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-green-700">🧑 Adultos confirmados ({stats.totalAd})</h2>
        <div className="mt-1"><Grid items={[...stats.adultSet.map((e) => e.disp + (e.src.length > 1 ? ` (em ${e.src.length})` : "")), ...Array.from({ length: stats.unAd }, () => "(sem nome)")]} /></div>

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-green-700">🧒 Crianças confirmadas ({stats.totalCr})</h2>
        <div className="mt-1"><Grid items={[...stats.childSet.map((e) => e.disp), ...Array.from({ length: stats.unCr }, () => "(sem nome)")]} /></div>
        {stats.ageStr && <div className="mt-1 text-xs text-gray-600"><b>Por idade:</b> {stats.ageStr}</div>}

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-orange-700">❌ Não poderão ir ({stats.naoVai.length})</h2>
        <div className="mt-1"><Grid items={stats.naoVai} /></div>

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-green-700">💚 Recados de quem vai — telão ({stats.msgVai.length})</h2>
        <div className="mt-1"><Msgs arr={stats.msgVai} /></div>

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-orange-700">💬 Recados de quem não vai ({stats.msgNao.length})</h2>
        <div className="mt-1"><Msgs arr={stats.msgNao} /></div>

        <h2 className="mt-5 border-b-2 border-stone-100 pb-1 text-green-700">🗑️ Gerenciar respostas ({rows.length})</h2>
        <div className="mt-2 space-y-1.5">
          {[...rows].reverse().map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border bg-stone-50 px-3 py-2 text-sm">
              <div><b>{r.nome}</b><br /><span className="text-xs text-gray-500">{(r.presenca || "").indexOf("Sim") === 0 ? `✅ ${r.adultos || "(sem nomes)"}${r.criancas ? " · 👧 " + r.criancas : ""}` : "❌ não vai"}</span></div>
              <button onClick={() => excluir(r.id, r.nome)} className="flex-none rounded-lg border border-orange-500 px-3 py-1.5 text-xs text-orange-700 hover:bg-orange-500 hover:text-white">excluir</button>
            </div>
          ))}
        </div>

        {data?.plano !== "pro" && adsP.length > 0 && (
          <div className="mt-5">
            <h2 className="border-b-2 border-stone-100 pb-1 text-green-700">🤝 Parceiros</h2>
            <div className="mt-2 space-y-2">
              {adsP.map((a) => (
                a.link
                  ? <a key={a.id} href={a.link} target="_blank" rel="noreferrer" className="block"><img src={a.midia_url || ""} alt={a.titulo || "parceiro"} className="w-full rounded-lg" /></a>
                  : <img key={a.id} src={a.midia_url || ""} alt={a.titulo || "parceiro"} className="w-full rounded-lg" />
              ))}
              <div className="text-center text-[10px] uppercase tracking-wide text-gray-400">publicidade</div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={enviarEmail} disabled={enviandoEmail} className="flex-1 rounded-lg bg-green-700 py-3 text-sm font-bold text-white disabled:opacity-50">{enviandoEmail ? "Enviando…" : "📧 Enviar relatório"}</button>
          <button onClick={megaCartaz} className="flex-1 rounded-lg bg-amber-500 py-3 text-sm font-bold text-amber-950">🖼️ Gerar prompt do Mega Cartaz</button>
          <button onClick={recarregar} className="flex-1 rounded-lg border border-green-600 py-3 text-sm font-bold text-green-700">🔄 Atualizar agora</button>
        </div>
      </div>
    </div>
  );
}
