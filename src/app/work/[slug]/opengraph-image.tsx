import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { caseStudies } from "@/content/site";
import { CaseCard, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Case study — Mahesh Loya";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudies.find((entry) => entry.slug === slug);
  if (!study) notFound();

  return new ImageResponse(
    <CaseCard title={study.title} premise={study.premise} stack={study.stack} />,
    { ...size, fonts: await loadOgFonts() },
  );
}
