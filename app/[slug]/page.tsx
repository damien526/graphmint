import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MAKERS, getMaker } from "@/lib/makers";
import { MakerLanding } from "@/components/MakerLanding";

export function generateStaticParams() {
  return MAKERS.map((m) => ({ slug: m.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const maker = getMaker(slug);
  if (!maker) return {};
  return {
    title: { absolute: maker.metaTitle },
    description: maker.metaDescription,
    alternates: { canonical: `/${maker.slug}` },
    openGraph: {
      title: maker.metaTitle,
      description: maker.metaDescription,
      url: `/${maker.slug}`,
      siteName: "Chartmint",
      type: "website",
      images: [{ url: `/og/${maker.slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: maker.metaTitle,
      description: maker.metaDescription,
      images: [`/og/${maker.slug}.png`],
    },
  };
}

export default async function MakerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const maker = getMaker(slug);
  if (!maker) notFound();
  return <MakerLanding maker={maker} />;
}
