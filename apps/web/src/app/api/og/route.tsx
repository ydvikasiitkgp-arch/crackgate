import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject") ?? "CrackGate";
  const title = searchParams.get("title") ?? "Mining Engineering Exam Prep";
  const subtitle = searchParams.get("subtitle") ?? "GATE · PSU · CIL · State Exams";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #f59e0b 0%, #1e3a5f 100%)",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 48 }}>⛏️</span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: 1,
            }}
          >
            CRACKGATE.IN
          </span>
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: 800,
          }}
        >
          {subject}
        </h1>
        <p
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            marginTop: 16,
            marginBottom: 8,
            maxWidth: 700,
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.65)",
            margin: 0,
            letterSpacing: 0.5,
          }}
        >
          {subtitle}
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
