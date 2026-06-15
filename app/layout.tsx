import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cerimonial — Gestor de Eventos",
  description: "Plataforma para cerimonialistas gerenciarem eventos e confirmações.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
