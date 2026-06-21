import type { Metadata } from "next";
import Link from "next/link";

const SITE = "https://confirmae.io";
const TITULO = "Confirmae — convites digitais com confirmação de presença (RSVP)";
const DESC = "Crie um convite digital, envie um link único por WhatsApp para cada convidado e acompanhe quem confirmou presença em tempo real. Ideal para casamentos, aniversários e festas. Tem plano grátis.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESC,
  keywords: ["confirmação de presença", "RSVP", "convite digital", "lista de convidados", "convite de casamento", "convite de aniversário", "confirmar presença WhatsApp", "convite online", "Confirmae"],
  alternates: { canonical: SITE },
  openGraph: { title: TITULO, description: DESC, url: SITE, siteName: "Confirmae", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", title: TITULO, description: DESC },
};

const FAQ: { q: string; a: string }[] = [
  { q: "O que é o Confirmae?", a: "O Confirmae é uma plataforma de convites digitais com confirmação de presença (RSVP). Você cria o convite do seu evento, envia um link para cada convidado e acompanha quem confirmou, quantas pessoas vão e quem ainda não respondeu — tudo em tempo real." },
  { q: "Como funciona a confirmação de presença?", a: "Cada convidado recebe um link único. Ao abrir, ele confirma se vai ou não, informa quantos adultos e crianças, e pode deixar um recado e uma foto. A resposta aparece na hora no painel do organizador, já atribuída àquela pessoa." },
  { q: "O Confirmae é grátis?", a: "Sim. O plano Lite é gratuito e permite criar o convite (com uma imagem), montar a lista de convidados e receber as confirmações. O plano Pro libera convite personalizado, múltiplos eventos e disparo automático no WhatsApp." },
  { q: "Preciso instalar algum aplicativo?", a: "Não. O convite e a confirmação funcionam por link, direto no navegador do convidado — sem instalar nada, no celular ou no computador." },
  { q: "Como envio os convites pelo WhatsApp?", a: "Você cadastra cada convidado com nome e telefone, e o Confirmae gera o link único de cada um. Com um toque você abre o WhatsApp já com a mensagem e o link prontos para enviar." },
  { q: "Serve para casamento, aniversário e outras festas?", a: "Sim. O Confirmae serve para qualquer evento: casamento, aniversário, chá de bebê, festa junina, formatura ou evento corporativo." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Confirmae",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE,
        description: DESC,
        inLanguage: "pt-BR",
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "Plano Lite gratuito" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* topo */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div className="text-xl font-bold text-green-700">Confirma<span className="text-amber-500">e</span></div>
        <Link href="/login" className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">Entrar</Link>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-3xl px-5 pb-6 pt-10 text-center">
        <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
          Convites digitais com <span className="text-green-700">confirmação de presença</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Crie o convite, envie um link único por WhatsApp para cada convidado e acompanhe em tempo real quem confirmou — adultos, crianças, recados e fotos. Para casamentos, aniversários e festas.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">Criar meu convite grátis</Link>
          <a href="#como-funciona" className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Ver como funciona</a>
        </div>
        <p className="mt-3 text-sm text-gray-500">Plano grátis · sem instalar nada · funciona pelo link</p>
      </section>

      {/* como funciona */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold text-gray-900">Como funciona</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { n: "1", t: "Crie o evento e o convite", d: "Monte um convite personalizado ou suba uma imagem pronta. Defina data, local e horário." },
            { n: "2", t: "Envie o link de cada convidado", d: "Cadastre os convidados com nome e WhatsApp. Cada um recebe um link único, já com o nome e o número de pessoas preenchidos." },
            { n: "3", t: "Acompanhe as confirmações", d: "Veja em tempo real quem vai, quem não vai e quem falta responder, além de recados e fotos para o telão." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-green-700 font-bold text-white">{s.n}</div>
              <h3 className="mt-4 font-semibold text-gray-900">{s.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* recursos */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-2xl font-bold text-gray-900">Tudo para organizar seu evento</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["🔗 Link único por convidado", "Cada pessoa abre o convite já com o nome e a quantidade de adultos e crianças."],
              ["✅ Confirmação de presença (RSVP)", "O convidado confirma se vai, quantos vão, e deixa recado e foto."],
              ["📊 Painel em tempo real", "Totais de adultos e crianças, quem confirmou e quem ainda falta."],
              ["💬 Recados e fotos pro telão", "Reúna mensagens e fotos dos convidados para exibir na festa."],
              ["📧 Relatório por e-mail", "Receba um resumo das confirmações automaticamente, no horário que escolher."],
              ["📱 Envio pelo WhatsApp", "Mande o convite de cada um com um toque, já com a mensagem pronta."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="font-semibold text-gray-900">{t}</div>
                <p className="mt-1 text-sm text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* planos */}
      <section className="mx-auto max-w-4xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold text-gray-900">Planos</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="text-lg font-bold text-gray-900">Lite</div>
            <div className="mt-1 text-sm text-gray-500">Grátis</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Convite com imagem</li>
              <li>• Lista de convidados e RSVP</li>
              <li>• Painel de confirmações</li>
              <li>• Envio no WhatsApp (1 toque)</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-green-600 p-6">
            <div className="text-lg font-bold text-green-700">Pro</div>
            <div className="mt-1 text-sm text-gray-500">Para quem quer mais</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Convite personalizado (temas)</li>
              <li>• Múltiplos eventos</li>
              <li>• Disparo automático no WhatsApp</li>
              <li>• Sem anúncios</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-center text-2xl font-bold text-gray-900">Perguntas frequentes</h2>
          <div className="mt-8 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-gray-900">{f.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/login" className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">Começar agora — é grátis</Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 py-8 text-center text-sm text-gray-400">
        Confirma<span className="text-amber-500">e</span> · convites digitais e confirmação de presença
      </footer>
    </main>
  );
}
