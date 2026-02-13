import { useEffect, useState } from "react";
import { theme } from "../atoms/tokens/theme.js";
import { SECTOR_COLORS } from "../atoms/tokens/palette.js";

const SECTOR_ORDER = ["crm", "project", "accounting", "payroll", "pos", "hotel", "document", "ecommerce", "consolidators"];

function _domainFromUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function SectorNewsSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data/sector_news.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>
        <div style={{ fontSize: 13 }}>Loading sector news...</div>
      </div>
    );
  }

  if (!data?.sectors) {
    return (
      <div>
        <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 12px" }}>
          No sector news yet. Run <code style={{ background: theme.surfaceAlt, padding: "2px 6px", borderRadius: 4 }}>npm run fetch:sector-news</code> to populate.
        </p>
      </div>
    );
  }

  const sectors = SECTOR_ORDER.filter((id) => data.sectors[id]).map((id) => ({
    id,
    ...data.sectors[id],
    color: SECTOR_COLORS[id] ?? theme.textMuted,
  }));

  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 4px" }}>
        Analyst and market news by sector — how analysts and markets view each SMB SaaS vertical.
      </p>
      <p style={{ fontSize: 11, color: theme.textTertiary, margin: "0 0 14px" }}>
        Run <code style={{ background: theme.surfaceAlt, padding: "1px 4px", borderRadius: 4 }}>npm run fetch:sector-news</code> periodically to refresh. Uses web search (no API).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {sectors.map((sector) => (
          <div
            key={sector.id}
            style={{
              background: theme.white,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                background: sector.color + "14",
                borderBottom: `1px solid ${theme.borderLight}`,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: 18 }}>{sector.icon}</span>
              <span>{sector.name}</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              {sector.articles?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, listStyle: "disc" }}>
                  {sector.articles.map((a, j) => (
                    <li key={j} style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.5 }}>
                      <span style={{ color: theme.text }}>{a.title}</span>
                      {(a.date || a.url) && (
                        <span style={{ fontSize: 11, color: theme.textTertiary, marginLeft: 6 }}>
                          {a.date && `${a.date}`}
                          {a.url && (
                            <>
                              {" · "}
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: theme.textSecondary, textDecoration: "underline" }}
                              >
                                {_domainFromUrl(a.url) || "Source"}
                              </a>
                            </>
                          )}
                        </span>
                      )}
                      {a.body && (
                        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, marginLeft: 4 }}>
                          {a.body}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: theme.textTertiary }}>No recent news.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
