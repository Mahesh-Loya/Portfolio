import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/site";

const BASE = "https://maheshloya.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), priority: 1 },
    ...caseStudies.map((study) => ({
      url: `${BASE}/work/${study.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
  ];
}
