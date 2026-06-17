import Painel from "./Painel";

type Params = { params: Promise<{ slug: string }> };

export const metadata = { title: "Painel dos organizadores — Cerimonial" };

export default async function Page({ params }: Params) {
  const { slug } = await params;
  return <Painel slug={slug} />;
}
