"use client";
import { useState } from "react";

const ROI_MAP = { 50: 1.0, 25: 0.5, 12.5: 0.25, 10: 0.125 };
const DEPTH_OPTIONS = [5, 7, 10, 12];
const ROI_OPTIONS = [10, 12.5, 25, 50];
const DEPTH_COLORS = { 5: "#ef4444", 7: "#f97316", 10: "#4ade80", 12: "#60a5fa" };

const fmt = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

function DepthDial({ value, onChange }) {
  const cx = 90, cy = 90, r = 68;
  const stops = [225, 270, 315, 360];

  function polarToXY(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(a1, a2, radius) {
    const start = polarToXY(a1, radius);
    const end = polarToXY(a2, radius);
    const large = (a2 - a1 + 360) % 360 > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  const selectedIndex = DEPTH_OPTIONS.indexOf(value);
  const activeColor = value ? DEPTH_COLORS[value] : "#1e3d28";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="180" height="120" viewBox="0 0 180 120">
        <path d={arcPath(225, 360, r)} fill="none" stroke="#1a3a2a" strokeWidth="10" strokeLinecap="round" />
        {value && (
          <path d={arcPath(225, stops[selectedIndex], r)} fill="none" stroke={activeColor}
            strokeWidth="10" strokeLinecap="round"
            style={{ transition: "all 0.3s ease", filter: `drop-shadow(0 0 6px ${activeColor}88)` }} />
        )}
        {DEPTH_OPTIONS.map((d, i) => {
          const pos = polarToXY(stops[i], r);
          const isSelected = d === value;
          const color = DEPTH_COLORS[d];
          return (
            <g key={d} onClick={() => onChange(d)} style={{ cursor: "pointer" }}>
              <circle cx={pos.x} cy={pos.y} r={isSelected ? 11 : 9}
                fill={isSelected ? color : "#0e1f14"} stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                style={{ transition: "all 0.2s", filter: isSelected ? `drop-shadow(0 0 6px ${color})` : "none" }} />
              <text x={pos.x} y={pos.y + 4.5} textAnchor="middle"
                fill={isSelected ? "#fff" : color} fontSize="9" fontWeight="700"
                fontFamily="'Courier New', monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}>{d}</text>
            </g>
          );
        })}
        {value ? (
          <>
            <text x={cx} y={cy - 8} textAnchor="middle" fill={activeColor} fontSize="28" fontWeight="900"
              fontFamily="'Courier New', monospace"
              style={{ filter: `drop-shadow(0 0 8px ${activeColor}66)` }}>{value}%</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#3d6b4f" fontSize="9"
              fontFamily="'Courier New', monospace" letterSpacing="2">DEPTH</text>
          </>
        ) : (
          <text x={cx} y={cy + 5} textAnchor="middle" fill="#2d5c3d" fontSize="10"
            fontFamily="'Courier New', monospace">SELECT</text>
        )}
      </svg>
      {value === 5 && (
        <div style={{ fontSize: 9, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: -4 }}>
          ⚠ Aggressive — Higher Assignment Risk
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a3a2a" }}>
      <span style={{ color: "#5a9b72", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: highlight || accent ? 17 : 14, color: highlight ? "#4ade80" : accent ? "#fbbf24" : "#e2f5e8" }}>
        {value}
      </span>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 10, color: "#5a9b72", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>{children}</div>;
}

const chip = {
  background: "#0e1f14", border: "1px solid #1e3d28",
  borderRadius: 20, padding: "3px 10px",
  fontSize: 10, color: "#5a9b72", letterSpacing: "0.06em"
};

function ScreenSettings({ depth, roi, setDepth, setRoi, onNext }) {
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Label>Depth Level</Label>
        <DepthDial value={depth} onChange={setDepth} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <Label>ROI Level</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ROI_OPTIONS.map(r => (
            <button key={r} className={"opt" + (roi === r ? " sel" : "")}
              onClick={() => setRoi(r)} style={{ padding: "9px 8px", fontSize: 14 }}>
              {r}%
              <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, color: roi === r ? "#86efac" : "#3d6b4f" }}>
                {ROI_MAP[r]}% min premium
              </div>
            </button>
          ))}
        </div>
      </div>
      <button className="go" disabled={!depth || !roi} onClick={onNext} style={{ width: "100%" }}>
        Next →
      </button>
    </div>
  );
}

function ScreenCalc({ depth, roi, onBack }) {
  const [priceInput, setPriceInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function calculate() {
    const price = parseFloat(priceInput.replace(/[$,]/g, ""));
    if (!price || isNaN(price) || price <= 0) { setError("Enter a valid price"); return; }
    setError("");
    const strikePrice = Math.round(price * (1 - depth / 100));
    const premiumPct = ROI_MAP[roi];
    const minPremium = price * (premiumPct / 100);
    setResult({ currentPrice: price, strikePrice, minPremium, premiumPct });
  }

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ ...chip, color: DEPTH_COLORS[depth], borderColor: DEPTH_COLORS[depth] + "55" }}>Depth: {depth}%</span>
        <span style={chip}>ROI: {roi}%</span>
        <span style={chip}>Min: {ROI_MAP[roi]}%</span>
        <button onClick={onBack} style={{ ...chip, background: "transparent", border: "1px dashed #1e3d28", color: "#3d6b4f", cursor: "pointer" }}>← Edit</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Label>Current Stock Price</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4ade80", fontSize: 16, fontWeight: 700, pointerEvents: "none" }}>$</span>
            <input type="number" placeholder="0.00" value={priceInput}
              onChange={e => { setPriceInput(e.target.value); setError(""); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && calculate()}
              min="0" step="0.01" style={{ paddingLeft: 26 }} />
          </div>
          <button className="go" onClick={calculate} style={{ flexShrink: 0, padding: "0 18px", fontSize: 13 }}>Calc</button>
        </div>
        {error && <div style={{ color: "#f87171", fontSize: 10, marginTop: 6 }}>⚠ {error}</div>}
      </div>
      {result && (
        <div style={{ background: "#0c1a10", border: "1.5px solid #1e3d28", borderRadius: 10, padding: "16px 20px" }}>
          <Row label="Current Price" value={fmt(result.currentPrice)} />
          <Row label={`Strike (−${depth}%)`} value={fmt(result.strikePrice)} highlight />
          <Row label="Min Premium/Share" value={fmt(result.minPremium)} accent />
          <Row label="Min Premium/Contract" value={fmt(result.minPremium * 100)} accent />
          <button className="go" onClick={() => { setPriceInput(""); setResult(null); }}
            style={{ width: "100%", marginTop: 14, background: "#132b1c", color: "#4ade80", border: "1px solid #2a5c38", fontSize: 12 }}>
            + New Price
          </button>
        </div>
      )}
    </div>
  );
}

export default function StrikeCalculator() {
  const [screen, setScreen] = useState(1);
  const [depth, setDepth] = useState(null);
  const [roi, setRoi] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#080f0a", fontFamily: "'Courier New', Courier, monospace", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", color: "#e2f5e8" }}>
      <style>{`
        @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(74,222,128,0.25); } 50% { box-shadow:0 0 0 5px rgba(74,222,128,0); } }
        * { box-sizing: border-box; }
        .opt { background:#0e1f14; border:1.5px solid #1e3d28; color:#7bb990; cursor:pointer; border-radius:6px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:0.04em; transition:all 0.15s; text-align:center; }
        .opt:hover { border-color:#4ade80; color:#4ade80; background:#102018; }
        .opt.sel { background:#132b1c; border-color:#4ade80; color:#4ade80; animation:pulse 1.8s ease-in-out infinite; }
        .go { background:#4ade80; color:#050e08; border:none; border-radius:7px; padding:11px 28px; font-family:'Courier New',monospace; font-size:13px; font-weight:900; letter-spacing:0.08em; cursor:pointer; transition:all 0.15s; text-transform:uppercase; }
        .go:hover { background:#86efac; transform:translateY(-1px); }
        .go:active { transform:translateY(1px); }
        .go:disabled { background:#1e3d28; color:#3d6b4f; cursor:not-allowed; transform:none; }
        input[type="number"] { background:#0e1f14; border:1.5px solid #1e3d28; color:#4ade80; border-radius:6px; padding:9px 12px; width:100%; font-family:'Courier New',monospace; font-size:17px; font-weight:700; outline:none; transition:border-color 0.15s; -moz-appearance:textfield; }
        input[type="number"]:focus { border-color:#4ade80; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        input::placeholder { color:#2d5c3d; font-size:13px; }
      `}</style>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "0.06em", color: "#4ade80", textShadow: "0 0 30px rgba(74,222,128,0.2)" }}>
          STRIKE CALCULATOR
        </h1>
        <div style={{ fontSize: 9, color: "#2d5c3d", letterSpacing: "0.2em", marginTop: 4 }}>CASH-SECURED PUTS</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: 24, height: 3, borderRadius: 2, background: screen >= s ? "#4ade80" : "#1e3d28", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>
      {screen === 1
        ? <ScreenSettings depth={depth} roi={roi} setDepth={setDepth} setRoi={setRoi} onNext={() => setScreen(2)} />
        : <ScreenCalc depth={depth} roi={roi} onBack={() => setScreen(1)} />
      }
    </div>
  );
}
