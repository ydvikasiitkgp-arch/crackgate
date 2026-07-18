"use client";

/**
 * Question Figure Engine
 * ----------------------
 * Data-driven SVG renderer for the diagram/chart asset classes a GATE Mining (MN)
 * paper requires. A question may carry an optional `figure` field; this component
 * dispatches on `figure.kind` to a dedicated, parametric SVG renderer so question
 * authors can describe diagrams as plain JSON (no hand-drawn SVG per question).
 *
 * Supported kinds:
 *   • "mohr"        – Mohr's circle of stress + optional failure envelope (φ, c)
 *   • "ventilation" – mine ventilation network (nodes, branches, airflow Q, regulators)
 *   • "bench"       – surface mining bench profile (burden, spacing, blast holes, slope)
 *   • "stress-block"– 2-D stress tensor element (σx, σy, τxy)
 *   • "stereonet"   – equal-area stereonet with great-circle plane(s)
 *   • "svg"         – escape hatch: raw SVG markup string
 */

import { cn } from "@/lib/utils";

export type QuestionFigure =
  | { kind: "mohr"; sigma1: number; sigma3: number; phi?: number; cohesion?: number; caption?: string }
  | {
      kind: "ventilation";
      nodes: { id: string; x: number; y: number }[];
      branches: { from: string; to: string; q?: number; r?: number; regulator?: boolean }[];
      caption?: string;
    }
  | { kind: "bench"; benchHeight: number; burden: number; spacing: number; holes?: number; slopeAngle?: number; caption?: string }
  | { kind: "stress-block"; sx: number; sy: number; txy: number; caption?: string }
  | { kind: "stereonet"; planes: { strike: number; dip: number; label?: string }[]; caption?: string }
  | {
      kind: "pq-curve";
      fan: { a: number; b: number; label?: string };
      resistances: { r: number; label?: string; color?: string }[];
      caption?: string;
    }
  | { kind: "svg"; markup: string; caption?: string };

export function QuestionFigure({ figure, className }: { figure: QuestionFigure; className?: string }) {
  return (
    <figure className={cn("my-4 rounded-lg border border-line bg-white p-3 overflow-hidden", className)}>
      <div className="w-full max-w-[480px] mx-auto max-h-[50vh] overflow-hidden grid place-items-center">
        {renderFigure(figure)}
      </div>
      {"caption" in figure && figure.caption && (
        <figcaption className="mt-2 text-center text-xs text-muted">{figure.caption}</figcaption>
      )}
    </figure>
  );
}

function renderFigure(f: QuestionFigure) {
  switch (f.kind) {
    case "mohr": return <MohrCircle {...f} />;
    case "ventilation": return <VentilationNetwork {...f} />;
    case "bench": return <BenchProfile {...f} />;
    case "stress-block": return <StressBlock {...f} />;
    case "stereonet": return <Stereonet {...f} />;
    case "pq-curve": return <PQCurve {...f} />;
    case "svg": return <div className="w-full [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: f.markup }} />;
  }
}

/* ------------------------------------------------------------------ */
/* A. Mohr's circle + failure envelope                               */
/* ------------------------------------------------------------------ */

function MohrCircle({ sigma1, sigma3, phi, cohesion = 0 }: { sigma1: number; sigma3: number; phi?: number; cohesion?: number }) {
  const W = 320, H = 220, padL = 36, padB = 30;
  const center = (sigma1 + sigma3) / 2;
  const radius = Math.abs(sigma1 - sigma3) / 2;
  const maxX = Math.max(sigma1, sigma3, center + radius) * 1.15 || 1;
  const sx = (W - padL - 10) / maxX;
  const sy = sx; // equal scale so circle stays circular
  const x0 = padL;
  const y0 = H - padB;
  const X = (v: number) => x0 + v * sx;
  const Y = (v: number) => y0 - v * sy;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px] h-auto">
      {/* axes */}
      <line x1={x0} y1={y0} x2={W - 6} y2={y0} stroke="#475569" strokeWidth="1.2" />
      <line x1={x0} y1={6} x2={x0} y2={y0} stroke="#475569" strokeWidth="1.2" />
      <text x={W - 8} y={y0 + 16} fontSize="10" textAnchor="end" fill="#475569">σ (normal)</text>
      <text x={x0 - 4} y={12} fontSize="10" textAnchor="end" fill="#475569">τ</text>

      {/* circle */}
      <circle cx={X(center)} cy={Y(0)} r={radius * sx} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth="1.6" />
      {/* σ3 and σ1 points */}
      <circle cx={X(sigma3)} cy={Y(0)} r="3" fill="#1e3a8a" />
      <circle cx={X(sigma1)} cy={Y(0)} r="3" fill="#1e3a8a" />
      <text x={X(sigma3)} y={y0 + 14} fontSize="9" textAnchor="middle" fill="#1e3a8a">σ₃={sigma3}</text>
      <text x={X(sigma1)} y={y0 + 14} fontSize="9" textAnchor="middle" fill="#1e3a8a">σ₁={sigma1}</text>

      {/* failure envelope τ = c + σ·tanφ */}
      {phi != null && (
        <line
          x1={X(0)} y1={Y(cohesion)}
          x2={X(maxX)} y2={Y(cohesion + maxX * Math.tan((phi * Math.PI) / 180))}
          stroke="#dc2626" strokeWidth="1.6" strokeDasharray="5 3"
        />
      )}
      {phi != null && (
        <text x={W - 10} y={Y(cohesion + maxX * Math.tan((phi * Math.PI) / 180)) - 4} fontSize="9" textAnchor="end" fill="#dc2626">
          φ={phi}°{cohesion ? `, c=${cohesion}` : ""}
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* B. Ventilation network                                            */
/* ------------------------------------------------------------------ */

function VentilationNetwork({ nodes, branches }: { nodes: { id: string; x: number; y: number }[]; branches: { from: string; to: string; q?: number; r?: number; regulator?: boolean }[] }) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const W = 340, H = 220;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[360px] h-auto">
      <defs>
        <marker id="varrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill="#0f766e" />
        </marker>
      </defs>
      {branches.map((b, i) => {
        const a = byId[b.from], c = byId[b.to];
        if (!a || !c) return null;
        const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#0f766e" strokeWidth="2" markerEnd="url(#varrow)" />
            {b.regulator && <rect x={mx - 5} y={my - 5} width="10" height="10" fill="#f59e0b" stroke="#b45309" transform={`rotate(45 ${mx} ${my})`} />}
            {(b.q != null || b.r != null) && (
              <text x={mx} y={my - 8} fontSize="9" textAnchor="middle" fill="#0f766e">
                {b.q != null ? `Q=${b.q}` : ""}{b.q != null && b.r != null ? " " : ""}{b.r != null ? `R=${b.r}` : ""}
              </text>
            )}
          </g>
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="9" fill="#fff" stroke="#0f766e" strokeWidth="2" />
          <text x={n.x} y={n.y + 3.5} fontSize="9" textAnchor="middle" fill="#0f766e" fontWeight="700">{n.id}</text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* C. Surface mining bench profile                                   */
/* ------------------------------------------------------------------ */

function BenchProfile({ benchHeight, burden, spacing, holes = 3, slopeAngle = 70 }: { benchHeight: number; burden: number; spacing: number; holes?: number; slopeAngle?: number }) {
  const W = 340, H = 200;
  const groundY = 150, topY = 60, faceX = 110;
  const dx = (H - topY) / Math.tan((slopeAngle * Math.PI) / 180);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[360px] h-auto">
      {/* rock mass */}
      <path d={`M${faceX},${topY} L${W - 10},${topY} L${W - 10},${groundY} L${faceX + dx},${groundY} Z`} fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
      {/* bench face slope */}
      <line x1={faceX} y1={topY} x2={faceX + dx} y2={groundY} stroke="#b45309" strokeWidth="2" />
      {/* floor */}
      <line x1={10} y1={groundY} x2={W - 10} y2={groundY} stroke="#475569" strokeWidth="1.5" />
      {/* blast holes (burden from face, spacing apart) */}
      {Array.from({ length: holes }).map((_, i) => {
        const hx = faceX + dx + 26 + i * 34;
        return <line key={i} x1={hx} y1={topY} x2={hx} y2={groundY - 4} stroke="#1e293b" strokeWidth="2" strokeDasharray="3 2" />;
      })}
      {/* burden dim */}
      <line x1={faceX + dx} y1={topY + 12} x2={faceX + dx + 26} y2={topY + 12} stroke="#dc2626" strokeWidth="1" markerEnd="url(#barrow)" markerStart="url(#barrow)" />
      <text x={faceX + dx + 13} y={topY + 8} fontSize="8" textAnchor="middle" fill="#dc2626">B={burden}</text>
      {/* spacing dim */}
      {holes > 1 && (
        <>
          <line x1={faceX + dx + 26} y1={groundY + 12} x2={faceX + dx + 60} y2={groundY + 12} stroke="#2563eb" strokeWidth="1" />
          <text x={faceX + dx + 43} y={groundY + 22} fontSize="8" textAnchor="middle" fill="#2563eb">S={spacing}</text>
        </>
      )}
      {/* bench height */}
      <text x={faceX - 6} y={(topY + groundY) / 2} fontSize="9" textAnchor="end" fill="#b45309">H={benchHeight}</text>
      <text x={faceX + 4} y={groundY + 14} fontSize="8" fill="#b45309">slope {slopeAngle}°</text>
      <defs>
        <marker id="barrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L4,3 L0,6 Z" fill="#dc2626" /></marker>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* D. 2-D stress element                                             */
/* ------------------------------------------------------------------ */

function StressBlock({ sx, sy, txy }: { sx: number; sy: number; txy: number }) {
  const W = 220, H = 220, c = 110, s = 50;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[220px] h-auto">
      <rect x={c - s} y={c - s} width={s * 2} height={s * 2} fill="rgba(37,99,235,0.06)" stroke="#2563eb" strokeWidth="1.5" />
      {/* σx arrows (left/right) */}
      <Arrow x1={c - s - 26} y1={c} x2={c - s - 4} y2={c} color="#dc2626" />
      <Arrow x1={c + s + 26} y1={c} x2={c + s + 4} y2={c} color="#dc2626" />
      <text x={c + s + 30} y={c - 6} fontSize="10" fill="#dc2626">σx={sx}</text>
      {/* σy arrows (top/bottom) */}
      <Arrow x1={c} y1={c - s - 26} x2={c} y2={c - s - 4} color="#16a34a" />
      <Arrow x1={c} y1={c + s + 26} x2={c} y2={c + s + 4} color="#16a34a" />
      <text x={c + 6} y={c - s - 16} fontSize="10" fill="#16a34a">σy={sy}</text>
      {/* τxy shear arrows */}
      <Arrow x1={c - s} y1={c - s - 12} x2={c + s} y2={c - s - 12} color="#7c3aed" />
      <text x={c} y={c + s + 30} fontSize="10" textAnchor="middle" fill="#7c3aed">τxy={txy}</text>
    </svg>
  );
}

function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const id = `ar-${Math.round(x1)}-${Math.round(y1)}-${Math.round(x2)}-${Math.round(y2)}`;
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={color} /></marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" markerEnd={`url(#${id})`} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* E. Stereonet (equal-area) with great circles                      */
/* ------------------------------------------------------------------ */

function Stereonet({ planes }: { planes: { strike: number; dip: number; label?: string }[] }) {
  const R = 100, cx = 110, cy = 110;
  const vh = 220 + planes.length * 13 + 6;
  return (
    <svg viewBox={`0 0 220 ${vh}`} className="w-full max-w-[220px] h-auto">
      <circle cx={cx} cy={cy} r={R} fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
      {/* N-S, E-W ticks */}
      <line x1={cx} y1={cy - R} x2={cx} y2={cy - R + 8} stroke="#475569" />
      <text x={cx} y={cy - R - 4} fontSize="10" textAnchor="middle" fill="#475569">N</text>
      {planes.map((p, i) => {
        // great circle as an arc rotated by strike; dip controls curvature offset
        const dipRad = (p.dip * Math.PI) / 180;
        const d = R * Math.cos(dipRad); // distance of arc apex from center
        const col = ["#2563eb", "#dc2626", "#16a34a"][i % 3];
        return (
          <g key={i} transform={`rotate(${p.strike} ${cx} ${cy})`}>
            <path
              d={`M ${cx} ${cy - R} A ${R} ${Math.max(8, R - d)} 0 0 1 ${cx} ${cy + R}`}
              fill="none" stroke={col} strokeWidth="1.8"
            />
          </g>
        );
      })}
      {/* legend */}
      {planes.map((p, i) => (
        <text key={i} x={10} y={222 + i * 13} fontSize="9" fill={["#2563eb", "#dc2626", "#16a34a"][i % 3]}>
          {p.label ?? `Plane ${i + 1}`}: {p.strike}/{p.dip}°
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* F. Fan characteristic P–Q curve + mine resistance parabola(s)     */
/* ------------------------------------------------------------------ */

function PQCurve({
  fan,
  resistances,
}: {
  fan: { a: number; b: number; label?: string };
  resistances: { r: number; label?: string; color?: string }[];
}) {
  const W = 360, H = 260, padL = 46, padB = 38, padT = 14, padR = 14;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // Fan: P = a − b·Q ; resistance: P = r·Q². Operating point solves r·Q² + b·Q − a = 0.
  const ops = resistances.map((res) => {
    const { r, b, a } = { r: res.r, b: fan.b, a: fan.a };
    const q = (-b + Math.sqrt(b * b + 4 * r * a)) / (2 * r);
    const p = a - b * q;
    return { q, p };
  });

  const qFanMax = fan.a / fan.b;                 // P = 0 intercept of the fan line
  const qMax = Math.max(qFanMax, ...ops.map((o) => o.q)) * 1.18 || 1;
  const pMax = Math.max(fan.a, ...ops.map((o) => o.p)) * 1.18 || 1;

  const X = (q: number) => padL + (q / qMax) * plotW;
  const Y = (p: number) => padT + plotH - (p / pMax) * plotH;

  // Fan polyline (straight): (0,a) → (qFanMax,0)
  const fanPts = `${X(0)},${Y(fan.a)} ${X(qFanMax)},${Y(0)}`;

  // Resistance parabolas (sampled)
  const N = 40;
  const colors = ["#dc2626", "#7c3aed", "#0891b2"];
  const parabolas = resistances.map((res, idx) => {
    const col = res.color ?? colors[idx % colors.length];
    let d = "";
    for (let i = 0; i <= N; i++) {
      const q = (qMax * i) / N;
      const p = res.r * q * q;
      if (p > pMax * 1.05) break;
      d += `${i === 0 ? "M" : "L"} ${X(q).toFixed(1)} ${Y(p).toFixed(1)} `;
    }
    return { d, col, label: res.label, op: ops[idx] };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[360px] h-auto">
      {/* axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#475569" strokeWidth="1.4" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#475569" strokeWidth="1.4" />
      <text x={padL - 30} y={padT + 6} fontSize="10" fill="#475569">P (Pa)</text>
      <text x={padL + plotW - 60} y={padT + plotH + 26} fontSize="10" fill="#475569">Q (m³/s)</text>

      {/* fan characteristic */}
      <polyline points={fanPts} fill="none" stroke="#2563eb" strokeWidth="2" />
      <text x={X(0) + 4} y={Y(fan.a) - 4} fontSize="9" fill="#2563eb">{fan.label ?? "Fan curve"}</text>

      {/* resistance parabolas + operating points */}
      {parabolas.map((pb, i) => (
        <g key={i}>
          <path d={pb.d} fill="none" stroke={pb.col} strokeWidth="2" />
          {pb.op && (
            <>
              <line x1={X(pb.op.q)} y1={Y(pb.op.p)} x2={X(pb.op.q)} y2={padT + plotH} stroke={pb.col} strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1={padL} y1={Y(pb.op.p)} x2={X(pb.op.q)} y2={Y(pb.op.p)} stroke={pb.col} strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx={X(pb.op.q)} cy={Y(pb.op.p)} r="3.5" fill={pb.col} />
            </>
          )}
          <text x={padL + 6} y={padT + 14 + i * 13} fontSize="9" fill={pb.col}>
            {pb.label ?? `Resistance ${i + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

