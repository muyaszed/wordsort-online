import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WordSort — a daily word sorting puzzle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: "16px", marginBottom: "36px" }}>
          {["🟩", "🟨", "🟦", "🟪"].map((emoji, i) => (
            <span key={i} style={{ fontSize: 64 }}>
              {emoji}
            </span>
          ))}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          WordSort
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#94a3b8",
            marginTop: 24,
            fontWeight: 400,
          }}
        >
          A daily word sorting puzzle
        </div>
      </div>
    ),
    { ...size }
  );
}
