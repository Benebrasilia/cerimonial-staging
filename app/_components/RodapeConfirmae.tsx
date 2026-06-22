"use client";

export default function RodapeConfirmae({ slug, titulo, imagem }: { slug: string; titulo?: string; imagem?: string | null }) {
  const link = (typeof window !== "undefined" ? window.location.origin : "https://confirmae.io") + "/e/" + slug;
  const legenda = (titulo ? titulo + " 🎉 " : "") + "Confirme sua presença: " + link;

  async function compartilhar() {
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: unknown) => Promise<void> }) : null;
    if (nav && nav.share) {
      try { await nav.share({ title: titulo || "Convite", text: legenda, url: link }); } catch { /* cancelado */ }
    } else {
      try { await navigator.clipboard.writeText(legenda); alert("Link copiado! Cole no Instagram."); } catch { alert(link); }
    }
  }
  async function copiarLegenda() {
    try { await navigator.clipboard.writeText(legenda); alert("Legenda copiada! 📋"); } catch { alert(legenda); }
  }

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 text-center">
        <div className="text-xs font-bold text-pink-700">📣 Divulgar no Instagram</div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button onClick={compartilhar} className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white">Compartilhar (Stories/Direct)</button>
          {imagem && <a href={imagem} target="_blank" rel="noreferrer" className="rounded-lg border border-pink-400 px-3 py-1.5 text-xs font-semibold text-pink-700">Baixar imagem</a>}
          <button onClick={copiarLegenda} className="rounded-lg border border-pink-400 px-3 py-1.5 text-xs font-semibold text-pink-700">Copiar legenda</button>
        </div>
        <p className="mt-1.5 text-[11px] text-gray-500">No celular abre o Instagram (Stories e Direct/DM). Para Reels/Feed, baixe a imagem e poste com a legenda.</p>
      </div>
      <a href="https://confirmae.io" target="_blank" rel="noreferrer" className="mt-3 block text-center text-xs text-gray-400 hover:text-green-700">💌 Crie seu convite grátis em <b>confirmae.io</b></a>
    </div>
  );
}
