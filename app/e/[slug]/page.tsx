import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventoPublico, getConvidado, formatarData } from "@/lib/eventoPublico";
import RsvpForm from "./RsvpForm";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventoPublico(slug);
  if (!ev) return { title: "Evento não encontrado — Confirmae" };
  const partes = [ev.local, formatarData(ev.data)].filter(Boolean).join(" · ");
  const titulo = `${ev.nome} — Confirme sua presença`;
  const desc = `Você é meu convidado! Toque para confirmar sua presença.${partes ? " 📍 " + partes : ""}`;
  return {
    title: titulo, description: desc,
    openGraph: { title: titulo, description: desc, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Page({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;
  const token = typeof sp.c === "string" ? sp.c : "";
  const ev = await getEventoPublico(slug);
  if (!ev) notFound();
  const convidado = token ? await getConvidado(token) : null;
  return <RsvpForm evento={ev} convidado={convidado} />;
}
