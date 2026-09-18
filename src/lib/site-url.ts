/**
 * The site's public origin, used for canonical URLs, OG tags and the sitemap.
 *
 * Resolved rather than hardcoded so the same build is correct everywhere:
 * Vercel injects its own production domain, so deploying needs no
 * configuration, and pointing a custom domain at it later is one env var
 * rather than a code change.
 */
function resolveSiteUrl(): string {
  // Set this once a custom domain exists; it wins over everything else.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Vercel's stable production domain for the project.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  // Any other Vercel deployment (preview branches, etc).
  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
