import { useState, useMemo } from "react";
import { Badge } from "../atoms/index.js";
import { SENTIMENT_COLORS } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

function dropColor(drop) {
  if (drop <= -40) return SENTIMENT_COLORS.error;
  if (drop <= -20) return "#FF7F00";
  if (drop <= -10) return SENTIMENT_COLORS.warning;
  return SENTIMENT_COLORS.success;
}

const regionOrd = (r, order) => (order[r] ?? 999);

export default function CompaniesList({ publicCos, regionOrder = {} }) {
  const [sortBy, setSortBy] = useState("pct");
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    const arr = [...publicCos];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "pct") {
      arr.sort((a, b) => {
        const aDrop = a.drop ?? 0;
        const bDrop = b.drop ?? 0;
        return sortDir === "asc" ? aDrop - bDrop : bDrop - aDrop;
      });
    } else if (sortBy === "sector") {
      arr.sort((a, b) => {
        const sectorCmp = (a.sectorName ?? "").localeCompare(b.sectorName ?? "");
        if (sectorCmp !== 0) return dir * sectorCmp;
        const regionCmp = regionOrd(a.region, regionOrder) - regionOrd(b.region, regionOrder);
        if (regionCmp !== 0) return dir * regionCmp;
        return a.drop - b.drop;
      });
    } else if (sortBy === "region") {
      arr.sort((a, b) => {
        const regionCmp = regionOrd(a.region, regionOrder) - regionOrd(b.region, regionOrder);
        if (regionCmp !== 0) return dir * regionCmp;
        const sectorCmp = (a.sectorName ?? "").localeCompare(b.sectorName ?? "");
        if (sectorCmp !== 0) return dir * sectorCmp;
        return a.drop - b.drop;
      });
    }
    return arr;
  }, [publicCos, sortBy, sortDir, regionOrder]);

  const worst = publicCos.length ? Math.min(...publicCos.map((c) => c.drop)) : 0;
  const least = publicCos.length ? Math.max(...publicCos.map((c) => c.drop)) : 0;
  const spreadText = publicCos.length > 0
    ? `The spread from -${Math.abs(worst)}% to -${Math.abs(least)}% shows this is not one trade.`
    : "";

  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 12px" }}>
        {publicCos.length} public companies ranked by 12-month decline. {spreadText}
      </p>
      <p style={{ fontSize: 11, color: theme.textMuted, margin: "0 0 12px", lineHeight: 1.5 }}>
        <strong style={{ color: theme.textSecondary }}>% =</strong> stock price decline from LTM high to baseline (Feb 3, 2026).
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: theme.textMuted, alignSelf: "center" }}>Sort by:</span>
        <button
          onClick={() => { setSortBy("pct"); setSortDir(sortBy === "pct" ? (sortDir === "asc" ? "desc" : "asc") : "asc"); }}
          style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 6,
            border: `1px solid ${sortBy === "pct" ? theme.border : theme.borderLight}`,
            background: sortBy === "pct" ? theme.surface : theme.white,
            color: theme.textSecondary,
            fontWeight: sortBy === "pct" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          % change {sortBy === "pct" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => { setSortBy("sector"); setSortDir(sortBy === "sector" ? (sortDir === "asc" ? "desc" : "asc") : "asc"); }}
          style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 6,
            border: `1px solid ${sortBy === "sector" ? theme.border : theme.borderLight}`,
            background: sortBy === "sector" ? theme.surface : theme.white,
            color: theme.textSecondary,
            fontWeight: sortBy === "sector" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          Sector {sortBy === "sector" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => { setSortBy("region"); setSortDir(sortBy === "region" ? (sortDir === "asc" ? "desc" : "asc") : "asc"); }}
          style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 6,
            border: `1px solid ${sortBy === "region" ? theme.border : theme.borderLight}`,
            background: sortBy === "region" ? theme.surface : theme.white,
            color: theme.textSecondary,
            fontWeight: sortBy === "region" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          Region {sortBy === "region" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
      </div>
      <div style={{ background: theme.white, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr 64px 100px",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderBottom: `1px solid ${theme.border}`,
            fontSize: 10,
            fontWeight: 600,
            color: theme.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: theme.surface,
          }}
        >
          <div>% change</div>
          <div>Company</div>
          <div>Region</div>
          <div>Sector</div>
        </div>
        {sorted.map((c, i) => (
          <div
            key={`${c.ticker}-${c.sectorName}`}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr 64px 100px",
              alignItems: "center",
              gap: 12,
              padding: "8px 12px",
              borderBottom: i < sorted.length - 1 ? `1px solid ${theme.borderLight}` : "none",
              fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 800, fontFamily: "monospace", color: dropColor(c.drop) }}>{c.drop}%</div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 700 }}>{c.name}</span>
              <span style={{ fontSize: 9, color: theme.textTertiary, fontFamily: "monospace", marginLeft: 4 }}>{c.ticker}</span>
            </div>
            <span style={{ fontSize: 10, color: theme.textMuted }}>{c.region || "—"}</span>
            <Badge color={c.sectorColor} bg={c.sectorColor + "12"}>
              {c.sectorIcon} {c.sectorShortName ?? (c.sectorName ?? "").split(" ")[0] || "—"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
