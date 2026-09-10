import { ImageResponse } from "next/og";

import { BrandMark } from "./brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1346E7",
      }}
    >
      <BrandMark size={104} fill="#FFFFFF" />
    </div>,
    size,
  );
}
