import { ImageResponse } from "next/og";
import { profile } from "@/content/site";
import { HomeCard, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt =
  "Mahesh Loya — I build AI products that businesses actually use.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    <HomeCard
      headline="I build AI products that businesses actually use."
      sub="WhatsApp assistants that handle voice notes and photos, voice agents that answer the phone, and search over your own data."
      role={`${profile.role} · ${profile.location}`}
    />,
    { ...size, fonts: await loadOgFonts() },
  );
}
