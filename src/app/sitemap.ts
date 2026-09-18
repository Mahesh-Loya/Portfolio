import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/site";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    ...caseStudies.map((study) => ({
      url: `${SITE_URL}/work/${study.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
  ];
}
