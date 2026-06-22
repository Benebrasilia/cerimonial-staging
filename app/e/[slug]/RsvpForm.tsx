"use client";
import RodapeConfirmae from "@/app/_components/RodapeConfirmae";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatarData, type EventoPublico, type Convidado } from "@/lib/eventoPublico";

const supabase = createClient();
const words = (s: string) => (s || "").trim().split(/\s+/).filter(Boolean);

type Crianca = { nome: string; idade: string };
type Anuncio = { id: string; tipo: string; titulo: string | null; midia_url: string | null; link: string | null };

// ---- Arte do tema "arraiá" (idêntica à produção) ----
const STAR = "M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z";
const SPARK = "M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z";
function starsHTML() {
  const c = ["#0a7c39", "#f4c20d", "#0a7c39", "#f4c20d", "#0a7c39"];
  let h = "";
  for (let i = 0; i < 5; i++) {
    const stroke = c[i] === "#f4c20d" ? ' stroke="#0a7c39" stroke-width="1"' : "";
    h += '<svg viewBox="0 0 24 24" width="22" height="22" fill="' + c[i] + '"' + stroke + '><path d="' + STAR + '"/></svg>';
  }
  h += '<span class="hexa"><svg viewBox="0 0 24 24" width="22" height="22"><path d="' + STAR + '" fill="transparent" stroke="#8a6d18" stroke-width="1.4" style="animation:hexaAppear 2.6s ease-in-out infinite;"/></svg><span class="spk"><svg viewBox="0 0 24 24" width="11" height="11" fill="#c9a227"><path d="' + SPARK + '"/></svg></span></span>';
  return h;
}
function buntingHTML(invert: boolean) {
  const tris = [[36.4,12.88],[64.8,15.12],[93.2,16.72],[121.6,17.68],[150,18],[178.4,17.68],[206.8,16.72],[235.2,15.12],[263.6,12.88]];
  let s = '<svg width="300" height="42" viewBox="0 0 300 42"><path d="M8 10 Q150 26 292 10" fill="none" stroke="#0a7c39" stroke-width="1.2"/>';
  tris.forEach((t, i) => {
    const cx = t[0], y = t[1];
    const pts = (cx - 8) + "," + y + " " + (cx + 8) + "," + y + " " + cx + "," + (y + 16);
    let yellow = i % 2 === 0; if (invert) yellow = !yellow;
    if (yellow) s += '<polygon class="fl" points="' + pts + '" fill="#f4c20d" stroke="#0a7c39" stroke-width="1"/>';
    else s += '<polygon class="fl" points="' + pts + '" fill="#0a7c39"/>';
  });
  return s + "</svg>";
}

const ARR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;0,900;1,500;1,600&family=Pinyon+Script&display=swap');
.arr{--green:#0a7c39;--yellow:#f4c20d;--gold:#c9a227;--cream:#f7f3e6;--terra:#bb4d28;--dategold:#ead06a;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;background-color:#e7e3d8;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='nb'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nb)' opacity='0.07'/%3E%3C/svg%3E");font-family:'Playfair Display',Georgia,serif;color:var(--green);padding:24px 14px 60px;}
.arr .card{position:relative;width:560px;max-width:100%;background-color:var(--cream);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.11'/%3E%3C/svg%3E");background-size:cover;border:2.5px solid var(--gold);box-shadow:0 18px 50px rgba(10,124,57,.16);padding:30px 32px 40px;}
.arr .gold{background:linear-gradient(180deg,#7a5d10,#d8b441 50%,#7a5d10);-webkit-background-clip:text;background-clip:text;color:transparent;}
.arr .t1{text-align:center;font-size:50px;font-weight:800;line-height:.98;letter-spacing:1px;}
.arr .scr{text-align:center;font-family:'Pinyon Script',cursive;font-size:40px;line-height:1;margin:1px 0;}
.arr .t2{text-align:center;font-size:66px;font-weight:800;line-height:1;letter-spacing:5px;}
.arr .stars{display:flex;gap:9px;align-items:center;justify-content:center;margin-top:8px;}
.arr .hexa{position:relative;display:inline-block;width:24px;height:24px;animation:hexaPulse 2.6s ease-in-out infinite;}
.arr .hexa .spk{position:absolute;top:-6px;right:-6px;width:11px;height:11px;animation:sparkle 2.6s ease-in-out infinite;}
.arr .bunting{display:flex;justify-content:center;animation:sway 3.6s ease-in-out infinite;transform-origin:top center;}
.arr .bunting2{display:flex;justify-content:center;margin-top:14px;animation:sway 4.1s ease-in-out infinite;transform-origin:top center;}
.arr .fl{transform-box:fill-box;transform-origin:50% 0%;animation:flutter 2.4s ease-in-out infinite;}
.arr .fl:nth-of-type(1){animation-delay:0s}.arr .fl:nth-of-type(2){animation-delay:.12s}.arr .fl:nth-of-type(3){animation-delay:.24s}.arr .fl:nth-of-type(4){animation-delay:.36s}.arr .fl:nth-of-type(5){animation-delay:.48s}.arr .fl:nth-of-type(6){animation-delay:.6s}.arr .fl:nth-of-type(7){animation-delay:.72s}.arr .fl:nth-of-type(8){animation-delay:.84s}.arr .fl:nth-of-type(9){animation-delay:.96s}
.arr .selo{display:block;margin:20px auto 4px;width:max-content;background:var(--green);color:var(--dategold);font-weight:700;font-size:22px;padding:8px 22px;border-radius:10px;border:1.4px solid var(--dategold);}
.arr .std{text-align:center;font-size:15px;font-weight:800;letter-spacing:4px;color:var(--terra);margin:14px 0 2px;animation:stdblink 2.4s ease-in-out infinite;}
.arr .subhdr{text-align:center;font-style:italic;font-size:18px;}
.arr .hr{text-align:center;font-style:italic;font-size:15px;opacity:.85;margin-top:3px;}
.arr .localline{text-align:center;font-weight:700;font-size:16px;color:var(--green);margin-top:8px;line-height:1.3;}
.arr .divider{height:1px;background:rgba(10,124,57,.18);margin:22px 0 18px;}
.arr .field{margin-bottom:6px;}
.arr label.q{display:block;font-weight:700;font-size:20px;margin-bottom:12px;line-height:1.25;}
.arr .qsub{font-size:13px;font-style:italic;opacity:.8;font-weight:400;margin-top:-6px;margin-bottom:14px;}
.arr input[type=text],.arr input[type=file],.arr select,.arr textarea{width:100%;font-family:'Playfair Display',serif;font-size:16px;color:var(--green);background:#fffdf7;border:1.5px solid rgba(10,124,57,.35);border-radius:8px;padding:13px 12px;outline:none;}
.arr textarea{resize:vertical;min-height:96px;line-height:1.4;}
.arr input:focus,.arr select:focus,.arr textarea:focus{border-color:var(--green);}
.arr select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%230a7c39'%3E%3Cpath d='M7 10L2 4h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;}
.arr .names{margin-top:14px;display:flex;flex-direction:column;gap:12px;}
.arr .nm{display:flex;flex-direction:column;gap:4px;}
.arr .nm span{font-size:13px;font-style:italic;opacity:.85;}
.arr .crow{display:flex;gap:8px;align-items:center;}
.arr .crow .namewrap{flex:1;}
.arr .crow .agewrap{width:118px;flex:none;}
.arr .navrow{display:flex;gap:10px;margin-top:26px;align-items:stretch;}
.arr .back{background:#fffdf7;border:1.5px solid rgba(10,124,57,.35);color:var(--green);border-radius:10px;padding:0 16px;cursor:pointer;font-family:inherit;font-size:20px;flex:none;}
.arr .back:hover{background:#eef7ef;}
.arr .btn{flex:1;min-width:0;white-space:normal;line-height:1.15;background:var(--green);color:var(--cream);font-family:'Playfair Display',serif;font-weight:700;font-size:19px;letter-spacing:.3px;border:1.4px solid var(--dategold);border-radius:10px;padding:13px 10px;cursor:pointer;transition:filter .15s;}
.arr .btn:hover{filter:brightness(1.08);}
.arr .btn:disabled{opacity:.6;}
.arr .btn.alt{background:#fffdf7;color:var(--green);border-color:rgba(10,124,57,.45);}
.arr .foot{text-align:center;margin-top:18px;font-size:13px;letter-spacing:2px;color:var(--terra);font-weight:700;}
.arr .err{color:var(--terra);font-size:13px;margin-top:8px;}
.arr .thanks{text-align:center;padding:24px 8px;}
.arr .thanks .big{font-size:40px;font-weight:800;}
.arr .thanks .scrk{font-family:'Pinyon Script',cursive;font-size:38px;margin:4px 0;}
.arr .thanks p{font-style:italic;font-size:17px;margin-top:14px;line-height:1.5;}
.arr .musicBtn{position:fixed;bottom:16px;right:16px;z-index:50;width:50px;height:50px;border-radius:50%;background:var(--green);color:#fff;border:2px solid var(--dategold);box-shadow:0 4px 14px rgba(0,0,0,.25);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.arr .musicBtn.off{background:#9a958a;border-color:#cfc9bb;}
@keyframes stdblink{0%,100%{opacity:1;}50%{opacity:.45;}}
@keyframes hexaAppear{0%,16%{fill:transparent;}50%,74%{fill:#c9a227;}100%{fill:transparent;}}
@keyframes hexaPulse{0%,16%{transform:scale(.7);opacity:.45;}50%,74%{transform:scale(1.15);opacity:1;}100%{transform:scale(.7);opacity:.45;}}
@keyframes sparkle{0%,30%{opacity:0;transform:scale(.3) rotate(0);}55%{opacity:1;transform:scale(1) rotate(45deg);}100%{opacity:0;transform:scale(.3) rotate(90deg);}}
@keyframes sway{0%{transform:rotate(-2.6deg);}50%{transform:rotate(2.6deg);}100%{transform:rotate(-2.6deg);}}
@keyframes flutter{0%{transform:rotate(-6deg);}50%{transform:rotate(6deg);}100%{transform:rotate(-6deg);}}
@media (max-width:620px){.arr .card{padding:24px 18px 30px;border-width:2px;}.arr .t1{font-size:38px;}.arr .scr{font-size:30px;}.arr .t2{font-size:46px;letter-spacing:3px;}.arr .selo{font-size:18px;padding:7px 16px;}.arr .subhdr{font-size:14px;}.arr label.q{font-size:18px;}.arr .btn{font-size:16px;letter-spacing:0;padding:13px 8px;}}
`;

export default function RsvpForm({ evento, convidado, slug }: { evento: EventoPublico; convidado?: Convidado | null; slug: string }) {
  const cfg = (evento.config || {}) as Record<string, unknown>;
  const arraia = cfg.tema === "arraia" && evento.plano === "pro";
  const travado = !!convidado?.travado;
  const titulo = (Array.isArray(cfg.titulo) ? cfg.titulo : []) as string[];
  const subtitulo = (cfg.subtitulo as string) || "";
  const saveTheDate = cfg.save_the_date === true && !(evento.horario && evento.horario.trim());
  const musicId = (cfg.musica_youtube as string) || "";

  const [pos, setPos] = useState(0);
  const [nome, setNome] = useState(convidado?.nome || "");
  const [vai, setVai] = useState<boolean | null>(null);
  const [adultos, setAdultos] = useState<string[]>(() => convidado ? Array.from({ length: Math.max(convidado.num_adultos, 1) }, (_, i) => i === 0 ? convidado.nome : "") : [""]);
  const [criancas, setCriancas] = useState<Crianca[]>(() => convidado ? Array.from({ length: Math.max(convidado.num_criancas, 0) }, () => ({ nome: "", idade: "" })) : []);
  const [mensagem, setMensagem] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPrev, setFotoPrev] = useState<string>("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [ads, setAds] = useState<Anuncio[]>([]);

  // anúncios (somente no plano Lite)
  useEffect(() => {
    if (evento.plano === "pro") return;
    supabase.from("anuncios").select("id,tipo,titulo,midia_url,link").eq("ativo", true).in("posicao", ["convite", "ambos"]).order("ordem")
      .then(({ data }) => { if (data) setAds(data as Anuncio[]); }, () => {});
  }, []);

  // contador de visitas (fire-and-forget)
  useEffect(() => {
    try {
      const KEY = "cerimonial_vid";
      let vid = localStorage.getItem(KEY) || "";
      if (!vid) { vid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY, vid); }
      supabase.from("visitas").insert({ evento_id: evento.id, vid, ua: (navigator.userAgent || "").slice(0, 200) }).then(() => {}, () => {});
    } catch { /* nunca quebra */ }
  }, []);

  // música
  const ytRef = useRef<HTMLIFrameElement>(null);
  const [music, setMusic] = useState(false);
  const [hint, setHint] = useState(true);
  function ytCmd(fn: string) { try { ytRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: fn, args: [] }), "*"); } catch { } }
  function toggleMusic() { if (music) { ytCmd("pauseVideo"); setMusic(false); } else { ytCmd("unMute"); ytCmd("playVideo"); setMusic(true); setHint(false); } }

  const temRecado = evento.ultimo_passo !== false;
  const fluxo = useMemo(() => {
    if (vai === true) return ["adultos", "criancas", ...(temRecado ? ["recado"] : [])];
    if (vai === false) return [...(temRecado ? ["recado"] : [])];
    return [];
  }, [vai, temRecado]);
  const passo = pos === 0 ? "nome" : fluxo[pos - 1];
  const ultimoPasso = pos > 0 && pos - 1 === fluxo.length - 1;

  function escolher(quer: boolean) {
    if (words(nome).length < 2) { setErro(nome ? "Coloque também o sobrenome." : "Por favor, preencha seu nome."); return; }
    setErro(""); setVai(quer);
    if (quer) setAdultos((a) => { const c = [...a]; c[0] = nome.trim(); return c; });
    const novo = quer ? ["adultos", "criancas", ...(temRecado ? ["recado"] : [])] : [...(temRecado ? ["recado"] : [])];
    if (novo.length === 0) enviar(quer); else setPos(1);
  }
  function validar(): boolean {
    if (passo === "adultos") { const ok = adultos.every((a) => words(a).length >= 2); if (!ok) setErro("Coloque nome e sobrenome de cada adulto."); return ok; }
    if (passo === "criancas") { const ok = criancas.every((c) => words(c.nome).length >= 2); if (!ok) setErro("Coloque nome e sobrenome de cada criança."); return ok; }
    return true;
  }
  function avancar() { if (!validar()) return; setErro(""); if (ultimoPasso) { enviar(vai === true); return; } setPos((p) => p + 1); }
  function voltar() { setErro(""); setPos((p) => Math.max(0, p - 1)); }

  function onFoto(f: File | null) {
    setFoto(f);
    setFotoPrev((prev) => { if (prev) URL.revokeObjectURL(prev); return f ? URL.createObjectURL(f) : ""; });
  }

  async function uploadFoto(): Promise<string | null> {
    if (!foto) return null;
    try {
      const ext = ((foto.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")) || "jpg";
      const path = `${evento.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage.from("fotos").upload(path, foto, { upsert: false, contentType: foto.type || "image/jpeg" });
      if (up.error) return null;
      const { data } = supabase.storage.from("fotos").getPublicUrl(path);
      return data.publicUrl || null;
    } catch { return null; }
  }

  async function enviar(quer: boolean) {
    setEnviando(true); setErro("");
    const adStr = quer ? adultos.map((a) => a.trim()).filter(Boolean).join(", ") : "";
    const crStr = quer ? criancas.map((c) => c.nome.trim() + (c.idade ? ` (${c.idade} anos)` : "")).filter(Boolean).join(", ") : "";
    const foto_url = await uploadFoto();
    const { error } = await supabase.from("confirmacoes").insert({
      evento_id: evento.id, nome: nome.trim(), presenca: quer ? "Sim" : "Não",
      num_adultos: quer ? adultos.length : null, adultos: adStr || null,
      num_criancas: quer ? criancas.length : null, criancas: crStr || null,
      mensagem: mensagem.trim() || null, foto_url, convidado_id: convidado?.convidado_id || null,
    });
    setEnviando(false);
    if (error) { setErro("Não foi possível enviar: " + error.message); return; }
    setEnviado(true);
  }

  const dataFmt = formatarData(evento.data);

  // ---------------- TEMA ARRAIÁ ----------------
  if (arraia) {
    const submitLabel = enviando ? "Enviando…" : ultimoPasso ? (vai ? "Confirmar! 🇧🇷⚽" : "Enviar resposta") : "Continuar";
    return (
      <div className="arr">
        <style dangerouslySetInnerHTML={{ __html: ARR_CSS }} />
        <div className="card">
          {!enviado ? (
            <>
              <div className="bunting" dangerouslySetInnerHTML={{ __html: buntingHTML(false) }} />
              {titulo[0] && <div className="t1">{titulo[0]}</div>}
              {titulo[1] && <div className="scr gold">{titulo[1]}</div>}
              {titulo[2] && <div className="t2">{titulo[2]}</div>}
              <div className="stars" dangerouslySetInnerHTML={{ __html: starsHTML() }} />
              {saveTheDate && <div className="std">✦ SAVE THE DATE ✦</div>}
              <span className="selo">{dataFmt || "Data a confirmar"}</span>
              {subtitulo && <div className="subhdr">{subtitulo}</div>}
              <div className="hr">{evento.horario && evento.horario.trim() ? evento.horario : "horário a confirmar"}</div>
              {evento.local && <div className="localline">📍 {evento.local}</div>}
              <div className="bunting2" dangerouslySetInnerHTML={{ __html: buntingHTML(true) }} />
              <div className="divider" />

              {passo === "nome" && (
                <div className="field">
                  <label className="q" htmlFor="nome">Pra começar, qual é o seu nome completo?</label>
                  <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome" />
                  {erro && <div className="err">{erro}</div>}
                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button type="button" className="btn" onClick={() => escolher(true)}>Eu vou! 🇧🇷⚽</button>
                    <button type="button" className="btn alt" onClick={() => escolher(false)}>Não vou poder 😢</button>
                  </div>
                </div>
              )}

              {passo === "adultos" && (
                <div className="field">
                  <label className="q">Quantos adultos vão? (incluindo você)</label>
                  <div className="qsub">💡 Uma resposta por família/grupo, incluindo todos juntos — assim ninguém é contado em dobro.</div>
                  <select value={adultos.length} disabled={travado} onChange={(e) => { const n = parseInt(e.target.value, 10); setAdultos((prev) => Array.from({ length: n }, (_, i) => i === 0 ? (prev[0] || nome.trim()) : (prev[i] || ""))); }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <div className="names">
                    {adultos.map((a, i) => (
                      <div className="nm" key={i}>
                        <span>{i === 0 ? "🧑 Adulto 1 (você)" : "👤 Adulto " + (i + 1)}</span>
                        <input type="text" value={a} onChange={(e) => setAdultos((prev) => prev.map((v, k) => k === i ? e.target.value : v))} placeholder="Nome e sobrenome" />
                      </div>
                    ))}
                  </div>
                  {erro && <div className="err">{erro}</div>}
                  <div className="navrow"><button type="button" className="back" onClick={voltar}>←</button><button type="button" className="btn" disabled={enviando} onClick={avancar}>{submitLabel}</button></div>
                </div>
              )}

              {passo === "criancas" && (
                <div className="field">
                  <label className="q">Quantas crianças vão? (até 12 anos)</label>
                  <div className="qsub">Coloque nome e sobrenome de cada uma — ajuda a não contar repetido.</div>
                  <select value={criancas.length} disabled={travado} onChange={(e) => { const n = parseInt(e.target.value, 10); setCriancas((prev) => Array.from({ length: n }, (_, i) => prev[i] || { nome: "", idade: "" })); }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 0 ? "Nenhuma" : n}</option>)}
                  </select>
                  <div className="names">
                    {criancas.map((c, i) => (
                      <div className="nm" key={i}>
                        <span>🧒 Criança {i + 1}</span>
                        <div className="crow">
                          <div className="namewrap"><input type="text" value={c.nome} onChange={(e) => setCriancas((prev) => prev.map((v, k) => k === i ? { ...v, nome: e.target.value } : v))} placeholder="Nome e sobrenome" /></div>
                          <div className="agewrap">
                            <select value={c.idade} onChange={(e) => setCriancas((prev) => prev.map((v, k) => k === i ? { ...v, idade: e.target.value } : v))}>
                              <option value="">Idade</option>
                              {Array.from({ length: 12 }, (_, a) => a + 1).map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {erro && <div className="err">{erro}</div>}
                  <div className="navrow"><button type="button" className="back" onClick={voltar}>←</button><button type="button" className="btn" disabled={enviando} onClick={avancar}>{submitLabel}</button></div>
                </div>
              )}

              {passo === "recado" && (
                <div>
                  <div className="field">
                    <label className="q">{vai ? "Qual é o seu grito de guerra pro Brasil? 🇧🇷" : "Que pena! 😢 Deixa mesmo assim seu grito de guerra 🇧🇷"}</label>
                    <div className="qsub">Vamos montar um <b>pôster exibido nos telões da festa</b> com a sua foto e o seu grito. Opcional — mas vamos animar o telão! 📺</div>
                    <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3} placeholder="Solta o grito! Ex.: É CAMPEÃO! Rumo ao hexa, vai Brasil! 💚💛" />
                  </div>
                  <div className="field" style={{ marginTop: 16 }}>
                    <label className="q" style={{ fontSize: 16 }}>Mande uma foto sua <b>com a camisa do Brasil</b> pro pôster do telão 📸 (opcional)</label>
                    <input type="file" accept="image/*" onChange={(e) => onFoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                    {fotoPrev && <div style={{ marginTop: 8 }}><img src={fotoPrev} alt="prévia" style={{ maxWidth: 130, borderRadius: 8, border: "1px solid #ccc" }} /></div>}
                  </div>
                  {erro && <div className="err">{erro}</div>}
                  <div className="navrow"><button type="button" className="back" onClick={voltar}>←</button><button type="button" className="btn" disabled={enviando} onClick={avancar}>{submitLabel}</button></div>
                </div>
              )}

              <div className="foot">CONTAMOS COM A SUA PRESENÇA</div>
              <RodapeConfirmae slug={slug} titulo={evento.nome} imagem={evento.convite_imagem_url} />
            </>
          ) : (
            <div className="thanks">
              <div className="stars" dangerouslySetInnerHTML={{ __html: starsHTML() }} />
              <div className="big gold">Obrigado!</div>
              <div className="scrk gold">{vai ? "presença confirmada" : "resposta registrada"}</div>
              {vai ? (
                <>
                  <p>A gente se vê{dataFmt ? ` dia ${dataFmt}` : ""}{titulo.length ? ", no " + titulo.join(" ") : ""}! 🇧🇷⚽</p>
                  {evento.local && <div className="localline" style={{ marginTop: 8 }}>📍 {evento.local}</div>}
                </>
              ) : (<p>Que pena! Fica para uma próxima. Obrigado por avisar 💚</p>)}
            </div>
          )}
        </div>

        {musicId && (
          <>
            <div aria-hidden style={{ position: "fixed", left: -9999, top: 0, width: 320, height: 180, opacity: 0, pointerEvents: "none" }}>
              <iframe ref={ytRef} title="trilha" width={320} height={180} style={{ border: 0 }}
                src={`https://www.youtube.com/embed/${musicId}?autoplay=0&loop=1&playlist=${musicId}&controls=0&playsinline=1&enablejsapi=1`}
                allow="autoplay; encrypted-media" />
            </div>
            {hint && !music && (
              <div style={{ position: "fixed", bottom: 20, right: 76, zIndex: 50, maxWidth: 200, background: "#0a7c39", color: "#f7f3e6", fontSize: 12, fontWeight: 700, lineHeight: 1.3, padding: "8px 12px", borderRadius: 12, border: "1.5px solid #ead06a", textAlign: "right" }}>👉 clique para ouvir o grito de guerra do Brasil 🇧🇷</div>
            )}
            <button type="button" className={"musicBtn" + (music ? "" : " off")} onClick={toggleMusic} title="Música" aria-label="Música">{music ? "🔊" : "▶️"}</button>
          </>
        )}
      </div>
    );
  }

  // ---------------- TEMA SIMPLES (outros eventos) ----------------
  if (enviado) {
    return (
      <Tela>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-700">Obrigado!</div>
          <div className="mt-1 text-lg text-gray-500">{vai ? "presença confirmada" : "resposta registrada"}</div>
          {vai ? (<><p className="mt-4 text-gray-700">A gente se vê{dataFmt ? ` dia ${dataFmt}` : ""}! 🎉</p>{evento.local && <p className="mt-2 font-semibold text-green-700">📍 {evento.local}</p>}</>) : (<p className="mt-4 text-gray-700">Que pena! Fica para uma próxima. Obrigado por avisar 💚</p>)}
        </div>
        <Anuncios items={ads} />
        <RodapeConfirmae slug={slug} titulo={evento.nome} imagem={evento.convite_imagem_url} />
      </Tela>
    );
  }
  return (
    <Tela>
      <div className="mb-5 text-center">
        {evento.convite_imagem_url && <img src={evento.convite_imagem_url} alt="convite" className="mb-4 w-full rounded-xl" />}
        <h1 className="text-2xl font-bold text-green-700">{evento.nome}</h1>
        <div className="mt-2 inline-block rounded-lg bg-green-700 px-4 py-1.5 text-sm font-bold text-amber-200">{dataFmt || "Data a confirmar"}</div>
        {evento.horario && <div className="mt-1 text-sm italic text-gray-600">{evento.horario}</div>}
        {evento.local && <div className="mt-1 text-sm font-semibold text-green-700">📍 {evento.local}</div>}
      </div>
      <div className="border-t border-gray-200 pt-5">
        {passo === "nome" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Pra começar, qual é o seu nome completo?</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
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
            <select value={adultos.length} disabled={travado} onChange={(e) => { const n = parseInt(e.target.value, 10); setAdultos((prev) => Array.from({ length: n }, (_, i) => i === 0 ? (prev[0] || nome.trim()) : (prev[i] || ""))); }} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {adultos.map((a, i) => (<input key={i} value={a} onChange={(e) => setAdultos((prev) => prev.map((v, k) => k === i ? e.target.value : v))} placeholder={`Adulto ${i + 1}${i === 0 ? " (você)" : ""} — nome e sobrenome`} className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />))}
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <Navegacao onBack={voltar} onNext={avancar} ultimo={ultimoPasso} vai={vai} enviando={enviando} />
          </div>
        )}
        {passo === "criancas" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Quantas crianças vão? (até 12 anos)</label>
            <select value={criancas.length} disabled={travado} onChange={(e) => { const n = parseInt(e.target.value, 10); setCriancas((prev) => Array.from({ length: n }, (_, i) => prev[i] || { nome: "", idade: "" })); }} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600">
              {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {criancas.map((c, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input value={c.nome} onChange={(e) => setCriancas((prev) => prev.map((v, k) => k === i ? { ...v, nome: e.target.value } : v))} placeholder={`Criança ${i + 1} — nome e sobrenome`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
                <select value={c.idade} onChange={(e) => setCriancas((prev) => prev.map((v, k) => k === i ? { ...v, idade: e.target.value } : v))} className="w-24 rounded-lg border border-gray-300 px-2 py-2.5 outline-none focus:border-green-600">
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
            <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3} placeholder="Escreva aqui…" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600" />
            <label className="mb-1 block text-sm font-medium">Foto pro telão (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => onFoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-green-800" />
            {fotoPrev && <img src={fotoPrev} alt="prévia" className="mt-2 max-w-[130px] rounded-lg border" />}
            {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
            <Navegacao onBack={voltar} onNext={avancar} ultimo={ultimoPasso} vai={vai} enviando={enviando} />
          </div>
        )}
      </div>
      <RodapeConfirmae slug={slug} titulo={evento.nome} imagem={evento.convite_imagem_url} />
      <Anuncios items={ads} />
    </Tela>
  );
}

function Anuncios({ items }: { items: Anuncio[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 space-y-2">
      {items.map((a) => <AnuncioView key={a.id} a={a} />)}
      <div className="text-center text-[10px] uppercase tracking-wide text-gray-400">publicidade</div>
    </div>
  );
}
function AnuncioView({ a }: { a: Anuncio }) {
  if (a.tipo === "video" && a.midia_url) {
    const yt = a.midia_url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    if (yt) return <div className="overflow-hidden rounded-xl"><iframe className="aspect-video w-full" src={`https://www.youtube.com/embed/${yt[1]}`} title={a.titulo || "anúncio"} allow="encrypted-media" /></div>;
    return <video src={a.midia_url} controls className="w-full rounded-xl" />;
  }
  if (a.tipo === "adsense") return null;
  const img = <img src={a.midia_url || ""} alt={a.titulo || "anúncio"} className="w-full rounded-xl" />;
  return a.link ? <a href={a.link} target="_blank" rel="noreferrer">{img}</a> : img;
}

function Tela({ children }: { children: React.ReactNode }) {
  return (<div className="grid min-h-screen place-items-center px-4 py-8"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">{children}</div></div>);
}
function Navegacao({ onBack, onNext, ultimo, vai, enviando }: { onBack: () => void; onNext: () => void; ultimo: boolean; vai: boolean | null; enviando: boolean; }) {
  return (
    <div className="mt-4 flex gap-3">
      <button onClick={onBack} className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-50">←</button>
      <button onClick={onNext} disabled={enviando} className="flex-1 rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-60">{enviando ? "Enviando…" : ultimo ? (vai ? "Confirmar presença 🎉" : "Enviar resposta") : "Continuar"}</button>
    </div>
  );
}
