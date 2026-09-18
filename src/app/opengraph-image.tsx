import { ImageResponse } from "next/og";
import { profile } from "@/content/site";
import { HomeCard, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Mahesh Loya — I make noisy reality machine-readable.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    <HomeCard thesis={profile.thesis} role={`${profile.role} · ${profile.location}`} />,
    { ...size, fonts: await loadOgFonts() },
  );
}
