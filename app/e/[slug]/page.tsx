import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventoPublico, formatarData } from "@/lib/eventoPublico";
import RsvpForm from "./RsvpForm";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventoPublico(slug);
  if (!ev) return { title: "Evento não encontrado — Cerimonial" };
  const partes = [ev.local, formatarData(ev.data)].filter(Boolean).join(" · ");
  const titulo = `${ev.nome} — Confirme sua presença`;
  const desc = `Você é meu convidado! Toque para confirmar sua presença.${partes ? " 📍 " + partes : ""}`;
  return {
    title: titulo,
    description: desc,
    openGraph: { title: titulo, description: desc, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const ev = await getEventoPublico(slug);
  if (!ev) notFound();
  return <RsvpForm evento={ev} />;
}
