// Edge Function: gera e envia o relatório de confirmações por e-mail (via Resend).
// Sem dependência do Google. Chamado pelo botão do painel e pelos disparos agendados.
// Segredos necessários (Supabase): RESEND_API_KEY. SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são automáticos.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND = Deno.env.get("RESEND_API_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

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
const esc = (s: string) => (s || "").toString().replace(/</g, "&lt;");
function imgUrl(u: string | null) {
  if (!u) return "";
  const m = String(u).match(/[-\w]{25,}/);
  return m ? `https://drive.google.com/thumbnail?id=${m[0]}&sz=w1000` : u;
}

type Row = Record<string, any>;
function computar(rows: Row[]) {
  const ordered = [...rows].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const ppl: Row[] = [];
  for (const r of ordered) {
    let idx = -1;
    for (let i = 0; i < ppl.length; i++) if (same(ppl[i].nome, r.nome) || (r.prev_nome && same(ppl[i].nome, r.prev_nome))) { idx = i; break; }
    if (idx >= 0) ppl[idx] = r; else ppl.push(r);
  }
  const addU = (set: string[], name: string) => { for (const e of set) if (same(e, name)) return; set.push(name); };
  const adultSet: string[] = [], childSet: string[] = [];
  let unAd = 0, unCr = 0;
  const naoVai: string[] = [], msgVai: Row[] = [], msgNao: Row[] = [];
  const ageCount: Record<string, number> = {};
  for (const p of ppl) {
    if ((p.presenca || "").indexOf("Sim") === 0) {
      const an = (p.adultos || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      const cn = (p.criancas || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      an.forEach((n: string) => addU(adultSet, n));
      cn.forEach((n: string) => { const base = n.replace(/\s*\(.*\)\s*$/, "").trim(); addU(childSet, base); const mm = n.match(/\((\d+)/); const a = mm ? mm[1] : "?"; ageCount[a] = (ageCount[a] || 0) + 1; });
      unAd += Math.max(0, (p.num_adultos || 0) - an.length);
      unCr += Math.max(0, (p.num_criancas || 0) - cn.length);
      if ((p.mensagem || "").trim() || p.foto_url) msgVai.push(p);
    } else if ((p.presenca || "").indexOf("N") === 0) {
      naoVai.push(p.nome);
      if ((p.mensagem || "").trim() || p.foto_url) msgNao.push(p);
    }
  }
  const totalAd = adultSet.length + unAd, totalCr = childSet.length + unCr;
  const ageKeys = Object.keys(ageCount).sort((a, b) => a === "?" ? 1 : b === "?" ? -1 : Number(a) - Number(b));
  const ageStr = ageKeys.map((a) => (a === "?" ? "sem idade" : a + (a === "1" ? " ano" : " anos")) + ": " + ageCount[a]).join(" &middot; ");
  return { totalAd, totalCr, unAd, unCr, adultSet, childSet, naoVai, msgVai, msgNao, ageStr };
}

function msgList(arr: Row[]) {
  if (!arr.length) return '<p style="color:#999;">&mdash;</p>';
  return arr.map((m) => '<div style="background:#f7f3e6;border-left:4px solid #c9a227;padding:8px 12px;margin:6px 0;border-radius:4px;">' +
    (m.foto_url ? '<a href="' + imgUrl(m.foto_url) + '"><img src="' + imgUrl(m.foto_url) + '" width="80" style="max-width:80px;border-radius:6px;float:left;margin:0 10px 4px 0;"></a>' : '') +
    '<b>' + esc(m.nome) + ':</b> ' + ((m.mensagem || "").trim() ? '"' + esc(m.mensagem) + '"' : '<i>(s&oacute; foto)</i>') +
    '<div style="clear:both;"></div></div>').join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (!RESEND) return json({ error: "RESEND_API_KEY ausente nos secrets" }, 500);
    const { slug, pwd } = await req.json().catch(() => ({}));
    if (!slug) return json({ error: "slug obrigatório" }, 400);
    const h = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

    const evs = await (await fetch(`${SUPABASE_URL}/rest/v1/eventos?slug=eq.${encodeURIComponent(slug)}&select=*`, { headers: h })).json();
    const ev = evs[0];
    if (!ev) return json({ error: "notfound" }, 404);
    if (!ev.painel_pwd || pwd !== ev.painel_pwd) return json({ error: "auth" }, 401);
    if (!ev.report_emails) return json({ error: "sem destinatários" }, 400);

    const rows: Row[] = await (await fetch(`${SUPABASE_URL}/rest/v1/confirmacoes?evento_id=eq.${ev.id}&select=*&order=created_at`, { headers: h })).json();
    const vrows: Row[] = await (await fetch(`${SUPABASE_URL}/rest/v1/visitas?evento_id=eq.${ev.id}&select=vid`, { headers: h })).json();
    const visTotal = vrows.length;
    const visUni = new Set(vrows.map((x) => x.vid)).size;

    const s = computar(rows);
    const horario = (ev.horario || "").trim();
    const quando = "29 de junho de 2026" + (horario ? " &middot; " + esc(horario) : " &middot; horário a confirmar");
    const box = (n: number, l: string) => '<td style="text-align:center;padding:10px 14px;"><div style="font-size:34px;font-weight:bold;color:#0a7c39;">' + n + '</div><div style="font-size:12px;color:#666;">' + l + '</div></td>';
    const html =
      '<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#234;">' +
      '<div style="background:#0a7c39;color:#f7f3e6;padding:16px;border-radius:10px 10px 0 0;text-align:center;"><h2 style="margin:0;">' + esc(ev.nome) + '</h2><div style="font-size:13px;opacity:.9;">' + quando + '</div></div>' +
      '<div style="border:1px solid #ddd;border-top:none;padding:18px;border-radius:0 0 10px 10px;">' +
      '<table style="width:100%;border-collapse:collapse;"><tr>' + box(s.totalAd, "Adultos") + box(s.totalCr, "Crianças") + box(s.totalAd + s.totalCr, "Total pessoas") + '</tr></table>' +
      '<div style="text-align:center;font-size:13px;color:#555;margin:10px 0 2px;">👀 <b>' + visUni + '</b> visitantes únicos na página &middot; ' + visTotal + ' acessos no total</div>' +
      '<h3 style="color:#0a7c39;border-bottom:1px solid #e2ddca;padding-bottom:5px;">Adultos confirmados (' + s.totalAd + ')</h3><p style="font-size:14px;line-height:1.6;">' + (s.adultSet.map(esc).join(", ") || "—") + (s.unAd ? " (+" + s.unAd + " sem nome)" : "") + '</p>' +
      '<h3 style="color:#0a7c39;border-bottom:1px solid #e2ddca;padding-bottom:5px;">Crianças confirmadas (' + s.totalCr + ')</h3><p style="font-size:14px;line-height:1.6;">' + (s.childSet.map(esc).join(", ") || "—") + (s.unCr ? " (+" + s.unCr + " sem nome)" : "") + '</p>' +
      (s.totalCr ? '<p style="font-size:13px;color:#555;margin:-4px 0 10px;"><b>Por idade:</b> ' + s.ageStr + '</p>' : '') +
      '<h3 style="color:#bb4d28;border-bottom:1px solid #e2ddca;padding-bottom:5px;">Não poderão ir (' + s.naoVai.length + ')</h3><p style="font-size:14px;line-height:1.6;">' + (s.naoVai.map(esc).join(", ") || "—") + '</p>' +
      '<h3 style="color:#0a7c39;border-bottom:1px solid #e2ddca;padding-bottom:5px;">Recados de quem vai - telão (' + s.msgVai.length + ')</h3>' + msgList(s.msgVai) +
      '<h3 style="color:#bb4d28;border-bottom:1px solid #e2ddca;padding-bottom:5px;">Recados de quem não vai (' + s.msgNao.length + ')</h3>' + msgList(s.msgNao) +
      '<p style="font-size:11px;color:#999;margin-top:18px;">Atualizado em ' + new Date().toLocaleString("pt-BR") + ' &middot; enviado automaticamente</p>' +
      '</div></div>';

    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: ev.report_from || "Cerimonial <onboarding@resend.dev>",
        to: ev.report_emails.split(",").map((x: string) => x.trim()).filter(Boolean),
        subject: `${ev.nome} - ${s.totalAd} adultos e ${s.totalCr} criancas confirmados`,
        html,
      }),
    });
    const out = await sendRes.json().catch(() => ({}));
    if (!sendRes.ok) return json({ error: "resend", detalhe: out }, 502);
    return json({ ok: true, id: out.id, total_pessoas: s.totalAd + s.totalCr });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
