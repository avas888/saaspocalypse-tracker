import { useEffect, useState, useMemo } from "react";
import { theme } from "../atoms/tokens/theme.js";

const regionOrd = (r, order) => (order[r] ?? 999);

export default function PrivateCompaniesList({ privateCos, regionOrder = {} }) {
  const [healthData, setHealthData] = useState(null);
  const [sortBy, setSortBy] = useState("sector");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetch("/api/data/private_health.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setHealthData(data))
      .catch(() => setHealthData(null));
  }, []);

  const getHealthFor = (companyName) =>
    healthData?.companies?.[companyName] ?? [];

  const sorted = useMemo(() => {
    const arr = [...privateCos];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "sector") {
      arr.sort((a, b) => {
        const sectorCmp = a.sectorName.localeCompare(b.sectorName);
        if (sectorCmp !== 0) return dir * sectorCmp;
        const regionCmp = regionOrd(a.region, regionOrder) - regionOrd(b.region, regionOrder);
        if (regionCmp !== 0) return dir * regionCmp;
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy === "region") {
      arr.sort((a, b) => {
        const regionCmp = regionOrd(a.region, regionOrder) - regionOrd(b.region, regionOrder);
        if (regionCmp !== 0) return dir * regionCmp;
        const sectorCmp = a.sectorName.localeCompare(b.sectorName);
        if (sectorCmp !== 0) return dir * sectorCmp;
        return a.name.localeCompare(b.name);
      });
    }
    return arr;
  }, [privateCos, sortBy, sortDir, regionOrder]);

  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 4px" }}>
        {privateCos.length} private SMB SaaS companies — shielded from public market panic but facing the same structural questions.
      </p>
      <p style={{ fontSize: 11, color: theme.textTertiary, margin: "0 0 14px" }}>
        Key observation: the most PROTECTED sectors (payroll, hotel PMS, restaurant POS) have the highest proportion of private companies.
      </p>
      <p style={{ fontSize: 10, color: theme.textTertiary, margin: "0 0 8px" }}>
        Health bullets show financing rounds, acquisitions, and other public indicators. Run <code style={{ background: theme.surfaceAlt, padding: "1px 4px", borderRadius: 4 }}>npm run fetch:private</code> periodically to refresh.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: theme.textMuted, alignSelf: "center" }}>Sort by:</span>
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
        {sorted.map((c, i) => {
          const items = getHealthFor(c.name);
          return (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderBottom: i < sorted.length - 1 ? `1px solid ${theme.borderLight}` : "none",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: items.length ? 6 : 0 }}>
                <div style={{ width: 20, textAlign: "center", flexShrink: 0 }}>{c.sectorIcon}</div>
                <span style={{ fontWeight: 700, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 10, color: theme.textMuted, width: 100, flexShrink: 0 }}>{c.sectorShortName ?? c.sectorName?.split(" ")[0] ?? "—"}</span>
                <span style={{ fontSize: 10, color: theme.textMuted, width: 56, flexShrink: 0 }}>{c.region || "—"}</span>
              </div>
              {items.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 28, listStyle: "disc" }}>
                  {items.map((item, j) => (
                    <li key={j} style={{ marginBottom: 4, color: theme.textSecondary }}>
                      <span style={{ color: theme.text }}>{item.summary}</span>
                      {" — "}
                      <span style={{ fontSize: 11, color: theme.textTertiary }}>
                        {item.date}
                        {item.url ? (
                          <>
                            {" · "}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: theme.textSecondary, textDecoration: "underline" }}
                            >
                              {item.source}
                            </a>
                          </>
                        ) : (
                          ` · ${item.source}`
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
