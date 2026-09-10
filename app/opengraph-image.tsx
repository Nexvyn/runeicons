import { ImageResponse } from "next/og";

export const alt = "Rune Icons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <span
        style={{
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: -4,
          color: "#000000",
        }}
      >
        Rune Icons
      </span>
    </div>,
    size,
  );
}
