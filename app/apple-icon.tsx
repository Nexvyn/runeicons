import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d4ed8",
          color: "white",
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
