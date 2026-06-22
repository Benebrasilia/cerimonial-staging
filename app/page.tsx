import type { Metadata } from "next";
import Link from "next/link";

const SITE = "https://confirmae.io";
const TITULO = "Confirmae — convites digitais com confirmação de presença (RSVP)";
const DESC = "Crie um convite digital, envie um link único por WhatsApp para cada convidado e acompanhe quem confirmou presença em tempo real. Ideal para casamentos, aniversários e festas. Tem plano grátis.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESC,
  keywords: ["confirmação de presença", "RSVP", "convite digital", "lista de convidados", "convite de casamento", "convite de aniversário", "confirmar presença WhatsApp", "convite online", "Confirmae", "casa de festa", "cerimonial", "revenue share eventos"],
  alternates: { canonical: SITE },
  openGraph: { title: TITULO, description: DESC, url: SITE, siteName: "Confirmae", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", title: TITULO, description: DESC },
};

const FAQ: { q: string; a: string }[] = [
  { q: "O que é o Confirmae?", a: "O Confirmae é uma plataforma de convites digitais com confirmação de presença (RSVP). Você cria o convite do seu evento, envia um link para cada convidado e acompanha quem confirmou, quantas pessoas vão e quem ainda não respondeu — tudo em tempo real." },
  { q: "Como funciona a confirmação de presença?", a: "Cada convidado recebe um link único. Ao abrir, ele confirma se vai ou não, informa quantos adultos e crianças, e pode deixar um recado e uma foto. A resposta aparece na hora no painel do organizador, já atribuída àquela pessoa." },
  { q: "O Confirmae é grátis?", a: "Sim. O plano Lite é gratuito e permite criar o convite (com uma imagem), montar a lista de convidados e receber as confirmações. O plano Pro libera convite personalizado, múltiplos eventos e disparo automático no WhatsApp." },
  { q: "Sou casa de festa, cerimonial ou gestor de eventos. Tenho revenue share?", a: "Sim. Casas de festa, cerimoniais e gestores de evento entram no programa de parceiros do Confirmae: você cria os eventos dos seus clientes, atribui cada um ao e-mail do anfitrião (que gerencia os próprios convidados) e recebe uma porcentagem (revenue share) sobre os planos Pro contratados através de você." },
  { q: "Preciso instalar algum aplicativo?", a: "Não. O convite e a confirmação funcionam por link, direto no navegador do convidado — sem instalar nada, no celular ou no computador." },
  { q: "Como envio os convites pelo WhatsApp?", a: "Você cadastra cada convidado com nome e telefone, e o Confirmae gera o link único de cada um. Com um toque você abre o WhatsApp já com a mensagem e o link prontos para enviar." },
  { q: "Serve para casamento, aniversário e outras festas?", a: "Sim. O Confirmae serve para qualquer evento: casamento, aniversário, chá de bebê, festa junina, formatura ou evento corporativo." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "SoftwareApplication", name: "Confirmae", applicationCategory: "BusinessApplication", operatingSystem: "Web", url: SITE, description: DESC, inLanguage: "pt-BR", offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "Plano Lite gratuito" } },
      { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* topo */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-green-700">Confirma<span className="text-amber-500">e</span></div>
          <nav className="hidden items-center gap-7 text-sm text-gray-500 md:flex">
            <a href="#como-funciona" className="hover:text-gray-900">Como funciona</a>
            <a href="#recursos" className="hover:text-gray-900">Recursos</a>
            <a href="#parceiros" className="hover:text-gray-900">Parceiros</a>
            <a href="#planos" className="hover:text-gray-900">Planos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">Entrar</Link>
            <Link href="/login" className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">Criar grátis</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-green-50 via-white to-white" />
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-20 text-center sm:pt-28">
          <span className="inline-block rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Plano grátis · sem instalar nada</span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-[#1d1d1f] sm:text-6xl">
            Convites digitais com<br /><span className="text-green-700">confirmação de presença</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
            Crie o convite, envie um link único por WhatsApp para cada convidado e acompanhe em tempo real quem confirmou — adultos, crianças, recados e fotos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-full bg-green-700 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md">Criar meu convite grátis</Link>
            <a href="#como-funciona" className="rounded-full border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-800 hover:bg-gray-50">Ver como funciona →</a>
          </div>
          <p className="mt-4 text-sm text-gray-400">Casamentos · aniversários · festas · eventos corporativos</p>
        </div>
      </section>

      {/* como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">Como funciona</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">Do convite à confirmação em três passos.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { n: "1", t: "Crie o evento e o convite", d: "Monte um convite personalizado ou suba uma imagem pronta. Defina data, local e horário." },
            { n: "2", t: "Envie o link de cada convidado", d: "Cadastre os convidados com nome e WhatsApp. Cada um recebe um link único, já com o nome e o número de pessoas." },
            { n: "3", t: "Acompanhe as confirmações", d: "Veja em tempo real quem vai, quem não vai e quem falta responder, além de recados e fotos para o telão." },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border border-gray-100 bg-gray-50/70 p-7 transition hover:bg-white hover:shadow-md">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-green-700 text-lg font-bold text-white">{s.n}</div>
              <h3 className="mt-5 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* recursos */}
      <section id="recursos" className="bg-[#fbfbfd] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl font-bold tracking-tight">Tudo para organizar seu evento</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["🔗 Link único por convidado", "Cada pessoa abre o convite já com o nome e a quantidade de adultos e crianças."],
              ["✅ Confirmação de presença (RSVP)", "O convidado confirma se vai, quantos vão, e deixa recado e foto."],
              ["📊 Painel em tempo real", "Totais de adultos e crianças, quem confirmou e quem ainda falta."],
              ["💬 Recados e fotos pro telão", "Reúna mensagens e fotos dos convidados para exibir na festa."],
              ["📧 Relatório por e-mail", "Receba um resumo das confirmações automaticamente, no horário que escolher."],
              ["📱 Envio pelo WhatsApp", "Mande o convite de cada um com um toque, já com a mensagem pronta."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-gray-100 bg-white p-6 transition hover:shadow-md">
                <div className="font-semibold">{t}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* parceiros / revenue share */}
      <section id="parceiros" className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-[28px] border border-green-200 bg-gradient-to-br from-green-700 to-green-900 px-6 py-12 text-white sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Programa de parceiros · Revenue share</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Casas de festa, cerimoniais e gestores de evento ganham com o Confirmae</h2>
            <p className="mx-auto mt-4 max-w-2xl text-green-50/90">
              Use o Confirmae nos eventos dos seus clientes e receba <b>revenue share</b>: uma porcentagem recorrente sobre os planos Pro contratados através de você. Você cria o evento, atribui ao e-mail do anfitrião — e ele gerencia os próprios convidados.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              ["🏛️ Casas de festa", "Ofereça o RSVP digital como diferencial e fature comissão a cada evento da sua casa."],
              ["💍 Cerimoniais", "Centralize as confirmações de todos os seus casamentos e eventos num só lugar."],
              ["📋 Gestores de evento", "Crie e organize vários eventos, cada um atribuído ao seu anfitrião."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <div className="text-lg font-semibold">{t}</div>
                <p className="mt-2 text-sm leading-relaxed text-green-50/85">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/login" className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-green-800 shadow-sm transition hover:bg-green-50">Quero ser parceiro</Link>
          </div>
        </div>
      </section>

      {/* planos */}
      <section id="planos" className="bg-[#fbfbfd] py-20">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-3xl font-bold tracking-tight">Planos</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-7">
              <div className="text-xl font-bold">Lite</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">Grátis</div>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
                <li>Convite com imagem</li>
                <li>Lista de convidados e RSVP</li>
                <li>Painel de confirmações</li>
                <li>Envio no WhatsApp (1 toque)</li>
              </ul>
              <Link href="/login" className="mt-7 block rounded-full border border-green-600 py-3 text-center text-sm font-semibold text-green-700 hover:bg-green-50">Começar grátis</Link>
            </div>
            <div className="relative rounded-3xl border-2 border-green-600 bg-white p-7 shadow-sm">
              <span className="absolute -top-3 right-6 rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">Mais completo</span>
              <div className="text-xl font-bold text-green-700">Pro</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">R$ 29,90<span className="text-base font-normal text-gray-500">/mês</span></div>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
                <li>Convite personalizado (temas)</li>
                <li>Múltiplos eventos</li>
                <li>Disparo automático no WhatsApp</li>
                <li>Sem anúncios</li>
              </ul>
              <Link href="/login" className="mt-7 block rounded-full bg-green-700 py-3 text-center text-sm font-semibold text-white hover:bg-green-800">Assinar Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">Perguntas frequentes</h2>
        <div className="mt-10 divide-y divide-gray-100">
          {FAQ.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/login" className="rounded-full bg-green-700 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-green-800">Começar agora — é grátis</Link>
        </div>
      </section>

      <footer className="border-t border-black/5 py-10 text-center text-sm text-gray-400">
        Confirma<span className="text-amber-500">e</span> · convites digitais e confirmação de presença · confirmae.io
      </footer>
    </main>
  );
}
