"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QRConvite({ valor, titulo, nome }: { valor: string; titulo?: string; nome?: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!valor) return;
    QRCode.toDataURL(valor, { width: 360, margin: 1, errorCorrectionLevel: "M", color: { dark: "#0a7c39", light: "#ffffff" } })
      .then(setSrc)
      .catch(() => {});
  }, [valor]);
  if (!valor) return null;
  return (
    <div className="mx-auto mt-4 max-w-xs rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <div className="text-sm font-semibold text-green-700">🎟️ Seu QR de entrada</div>
      {titulo && <div className="mt-0.5 text-xs text-gray-500">{titulo}</div>}
      {src
        ? <img src={src} alt="QR de entrada" className="mx-auto my-2 h-44 w-44" />
        : <div className="mx-auto my-2 grid h-44 w-44 place-items-center text-xs text-gray-400">gerando…</div>}
      {nome && <div className="text-sm font-bold text-gray-900">{nome}</div>}
      <p className="mt-1 text-[11px] text-gray-400">Apresente na entrada do evento. Salve a tela ou baixe abaixo.</p>
      {src && <a href={src} download="meu-qr-confirmae.png" className="mt-2 inline-block rounded-full border border-green-600 px-4 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">Baixar QR</a>}
    </div>
  );
}
