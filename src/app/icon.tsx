import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The tab mark: the same lime-on-void monogram used in the nav, so the
 * favicon, the nav and the share cards all read as one identity.
 */
export default async function Icon() {
  const font = await readFile(join(process.cwd(), "assets", "inter-tight-500.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#c6f24e",
          fontSize: 19,
          fontFamily: "Sans",
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        ML
      </div>
    ),
    { ...size, fonts: [{ name: "Sans", data: font, weight: 500, style: "normal" }] },
  );
}
