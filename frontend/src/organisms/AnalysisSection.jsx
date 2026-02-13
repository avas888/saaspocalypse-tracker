import { useState } from "react";
import { theme } from "../atoms/tokens/theme.js";
import { ACCENT } from "../atoms/tokens/semantic.js";

/* ─── Analysis registry ─── */
const ANALYSES = [
  {
    id: "xero-vs-intuit",
    title: "Same Sector, Different Fates",
    subtitle: "Why Xero was hit 3× harder than Intuit in the accounting selloff",
    date: "Feb 13, 2026",
    sector: "Accounting & Invoicing",
    readTime: "6 min read",
    tickers: ["XRO.AX", "INTU"],
    heroStat: { label: "Punishment gap", value: "3×" },
  },
];

/* ─── Reusable article primitives ─── */

function CategoryLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: ACCENT,
        fontWeight: 700,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Headline({ children }) {
  return (
    <h1
      style={{
        fontFamily: "'Newsreader', Georgia, serif",
        fontSize: "clamp(28px, 5vw, 42px)",
        fontWeight: 400,
        fontStyle: "italic",
        lineHeight: 1.12,
        margin: "0 0 14px",
        color: theme.text,
      }}
    >
      {children}
    </h1>
  );
}

function Byline({ date, readTime }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        color: theme.textMuted,
        marginBottom: 6,
      }}
    >
      <span>{date}</span>
      <span style={{ color: theme.border }}>·</span>
      <span>{readTime}</span>
    </div>
  );
}

function TickerBadges({ tickers }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {tickers.map((t) => (
        <span
          key={t}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 4,
            background: theme.surfaceAlt,
            border: `1px solid ${theme.border}`,
            color: theme.textSecondary,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      style={{
        width: 40,
        height: 2,
        background: theme.border,
        margin: "36px 0",
      }}
    />
  );
}

function SectionNumber({ n }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        color: ACCENT,
        marginRight: 8,
      }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function SectionHeading({ number, children }) {
  return (
    <h2
      style={{
        fontFamily: "'Newsreader', Georgia, serif",
        fontSize: 22,
        fontWeight: 600,
        lineHeight: 1.3,
        margin: "0 0 16px",
        color: theme.text,
      }}
    >
      <SectionNumber n={number} />
      {children}
    </h2>
  );
}

function Paragraph({ children, style: extra }) {
  return (
    <p
      style={{
        fontFamily: "'Newsreader', Georgia, serif",
        fontSize: 16,
        lineHeight: 1.72,
        color: theme.textSecondary,
        margin: "0 0 18px",
        ...extra,
      }}
    >
      {children}
    </p>
  );
}

function Strong({ children, color }) {
  return (
    <strong style={{ fontWeight: 700, color: color || theme.text }}>
      {children}
    </strong>
  );
}

function PullQuote({ children }) {
  return (
    <blockquote
      style={{
        margin: "28px 0",
        padding: "16px 0 16px 20px",
        borderLeft: `3px solid ${ACCENT}`,
        fontFamily: "'Newsreader', Georgia, serif",
        fontSize: 18,
        fontStyle: "italic",
        lineHeight: 1.6,
        color: theme.text,
      }}
    >
      {children}
    </blockquote>
  );
}

function DataCallout({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 12,
        margin: "28px 0",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            padding: "16px 14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 24,
              fontWeight: 700,
              color: item.color || theme.text,
              lineHeight: 1.2,
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.textMuted,
              marginTop: 6,
            }}
          >
            {item.label}
          </div>
          {item.sub && (
            <div
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 11,
                color: theme.textTertiary,
                marginTop: 4,
              }}
            >
              {item.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul
      style={{
        margin: "0 0 18px",
        paddingLeft: 20,
        listStyleType: "none",
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 15,
            lineHeight: 1.7,
            color: theme.textSecondary,
            marginBottom: 8,
            position: "relative",
            paddingLeft: 14,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              color: ACCENT,
              fontWeight: 700,
            }}
          >
            —
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ComparisonTable() {
  const headerStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: theme.textMuted,
    padding: "10px 14px",
    textAlign: "left",
    borderBottom: `2px solid ${theme.text}`,
  };
  const cellStyle = {
    fontFamily: "'Newsreader', Georgia, serif",
    fontSize: 14,
    lineHeight: 1.5,
    padding: "12px 14px",
    borderBottom: `1px solid ${theme.borderLight}`,
    color: theme.textSecondary,
    verticalAlign: "top",
  };
  const factorStyle = {
    ...cellStyle,
    fontWeight: 600,
    color: theme.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
  };

  const rows = [
    {
      factor: "Valuation entry",
      intuit: "Already 46% below LTM high. P/E pre-compressed.",
      xero: "Near LTM high. Trading at ~102× earnings.",
    },
    {
      factor: "M&A risk",
      intuit: "Clean balance sheet. No major recent acquisitions.",
      xero: "$2.5B Melio deal + dilutive A$1.85B placement.",
    },
    {
      factor: "US market position",
      intuit: "62% SMB share. Deep lock-in via tax + payroll.",
      xero: "Challenger. N. America growth slowing to 21%.",
    },
    {
      factor: "AI exposure",
      intuit: "Tax code moat. Decades of regulatory data.",
      xero: "Core workflows closer to commodity SaaS.",
    },
    {
      factor: "Revenue quality",
      intuit: "Diversified: QBO, TurboTax, Credit Karma, Mailchimp.",
      xero: "Growth driven by price increases, not seat expansion.",
    },
    {
      factor: "Post-Feb 3",
      intuit: "−7%",
      xero: "−24%",
    },
  ];

  return (
    <div
      style={{
        margin: "28px 0",
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        overflow: "hidden",
        background: theme.surface,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ ...headerStyle, width: "28%" }}>Factor</th>
            <th style={{ ...headerStyle, width: "36%" }}>Intuit (INTU)</th>
            <th style={{ ...headerStyle, width: "36%" }}>Xero (XRO.AX)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 1 ? theme.surfaceAlt : "transparent",
              }}
            >
              <td style={factorStyle}>{r.factor}</td>
              <td style={cellStyle}>{r.intuit}</td>
              <td style={cellStyle}>{r.xero}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── The Article ─── */

function XeroVsIntuitArticle() {
  return (
    <article style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <CategoryLabel>Deep Dive · Accounting & Invoicing</CategoryLabel>
      <Headline>
        Same Sector, <Strong color={ACCENT}>Different Fates</Strong>
      </Headline>
      <Paragraph style={{ fontSize: 18, color: theme.textMuted, marginBottom: 20, fontStyle: "italic" }}>
        Both sell accounting software to small businesses. Both faced the same macro storm. Yet the market punished Xero three times harder than Intuit from February 3 onwards. The reasons illuminate how the SaaSPocalypse discriminates.
      </Paragraph>
      <Byline date="Feb 13, 2026" readTime="6 min read" />
      <TickerBadges tickers={["XRO.AX", "INTU"]} />

      {/* Hero Stats */}
      <DataCallout
        items={[
          { value: "−7%", label: "Intuit from Feb 3", sub: "Already −46% from LTM high", color: "#CCBB44" },
          { value: "−24%", label: "Xero from Feb 3", sub: "Was near its LTM high", color: "#EE6677" },
          { value: "3×", label: "Punishment gap", sub: "Same sector, different fates" },
        ]}
      />

      <Paragraph>
        On February 5, 2026, Xero shares plunged 15.9% in a single session — its worst day since the March 2020 pandemic crash. In the days that followed, the stock continued bleeding, eventually sitting 24% below its February 3 baseline. Meanwhile, Intuit — the other giant in accounting SaaS — shed just 7% over the same window.
      </Paragraph>
      <Paragraph>
        Both companies sell financial management tools to small and medium businesses. Both compete for overlapping customers. Both were caught in the same AI-fear-driven tech selloff. Yet the market delivered a strikingly asymmetric verdict.
      </Paragraph>
      <Paragraph>
        Why? Five structural factors created a 3× punishment gap between two companies that, on paper, inhabit the same sector.
      </Paragraph>

      <SectionDivider />

      {/* Section 1 */}
      <SectionHeading number={1}>The Valuation Starting Point</SectionHeading>
      <PullQuote>
        When a stock trading at 100× earnings re-rates to 70×, that's a 30% decline from multiple compression alone — even if the business executes flawlessly.
      </PullQuote>
      <Paragraph>
        When the selloff began, Xero was trading at approximately <Strong>102× earnings</Strong> — a premium that left zero margin for disappointment. Intuit, by contrast, had already undergone a painful <Strong>38% P/E compression</Strong> between November 2025 and February 2026, bringing its multiple from elevated heights down to a more defensible range.
      </Paragraph>
      <Paragraph>
        The math is unforgiving. Intuit entered February 3 already <Strong>46% below its last-twelve-month high</Strong>. The bad news was priced in. Xero entered at cruising altitude — near its LTM high — with valuations that assumed flawless execution in a deteriorating environment.
      </Paragraph>
      <Paragraph>
        The selloff hit Intuit on the tarmac. It hit Xero at 40,000 feet.
      </Paragraph>

      <SectionDivider />

      {/* Section 2 */}
      <SectionHeading number={2}>The $2.5 Billion Albatross</SectionHeading>
      <Paragraph>
        In June 2025, Xero acquired <Strong>Melio</Strong> — an American payments platform — for US$2.5 billion. To finance the deal, Xero raised A$1.85 billion through a discounted institutional placement at A$176 per share, immediately triggering a 9% drop on dilution concerns.
      </Paragraph>
      <Paragraph>
        The consequences have compounded since:
      </Paragraph>
      <BulletList
        items={[
          <><Strong>Dilution overhang:</Strong> On January 15, 2026 — barely three weeks before the crash — 1.26 million Melio acquisition shares were released from escrow, increasing the free float at the worst possible moment.</>,
          <><Strong>Margin erosion:</Strong> Despite 20% operating revenue growth, Xero's gross profit margins declined. Melio is unprofitable and won't reach adjusted EBITDA breakeven until the second half of fiscal 2028.</>,
          <><Strong>Strategic uncertainty:</Strong> Analyst price targets for Xero now range from A$71 to A$398 — a spread that signals profound disagreement about whether Melio is transformative or destructive.</>,
        ]}
      />
      <Paragraph>
        Intuit made no comparable bet-the-company acquisition. Its QuickBooks platform generates recurring revenue from a dominant market position. No dilution. No integration risk. No unprofitable subsidiary dragging on margins.
      </Paragraph>

      <SectionDivider />

      {/* Section 3 */}
      <SectionHeading number={3}>Geographic Moat Depth</SectionHeading>
      <Paragraph>
        Intuit owns <Strong>~62% of the US SMB accounting market</Strong> through QuickBooks. This concentration — usually cited as a risk — became a shield. Decades of tax filing data, payroll integrations, and accounting workflows create switching costs that are measured in years, not months.
      </Paragraph>
      <Paragraph>
        Xero dominates in New Zealand and Australia, but its growth story depends on cracking the US market — precisely where Intuit is impregnable. North America revenue growth slowed to <Strong>just 21%</Strong>, well below expectations. The Melio acquisition was, in part, an attempt to buy a US distribution channel. The market is skeptical it will work.
      </Paragraph>
      <PullQuote>
        Intuit's moat is geographic and regulatory. Xero's moat is regional and aspirational. The selloff punished aspiration.
      </PullQuote>

      <SectionDivider />

      {/* Section 4 */}
      <SectionHeading number={4}>The AI Wild Card</SectionHeading>
      <Paragraph>
        The February selloff was catalyzed in part by fears that AI could erode software "lock-in" business models. This threat landed asymmetrically on our two companies.
      </Paragraph>
      <Paragraph>
        <Strong>Intuit</Strong> has decades of tax code data, regulatory compliance infrastructure, and integration depth that even the most capable AI can't easily replicate. TurboTax's moat isn't just software — it's institutional knowledge encoded in decades of regulatory relationships.
      </Paragraph>
      <Paragraph>
        <Strong>Xero</Strong> is more exposed. Its core invoicing and bookkeeping workflows are closer to "commodity SaaS" that AI could theoretically simplify or disrupt. When Australia's IT sector index fell 9.4% on February 5, Xero fell 15.9% — nearly double the sector — suggesting the market views its moat as thinner than peers'.
      </Paragraph>
      <Paragraph>
        Xero responded the next day with an AI roadmap presentation, and the stock recovered 1.6%. But a slide deck doesn't fill a moat.
      </Paragraph>

      <SectionDivider />

      {/* Section 5 */}
      <SectionHeading number={5}>Pricing Power Exhaustion</SectionHeading>
      <Paragraph>
        A subtle but critical factor: Xero's recent revenue growth was <Strong>heavily driven by price increases</Strong> rather than seat expansion. Morningstar flagged that this pace of pricing cannot be sustained. When growth depends on charging existing customers more rather than acquiring new ones, any crack in willingness to pay becomes existential.
      </Paragraph>
      <Paragraph>
        Intuit's revenue mix is more diversified — QuickBooks, TurboTax, Credit Karma, and Mailchimp each contribute independently. No single pricing lever is load-bearing. The board even approved a <Strong>15% dividend increase</Strong> in Q1 2026, signaling confidence in cash flow durability that Xero simply cannot match.
      </Paragraph>

      <SectionDivider />

      {/* Verdict */}
      <div
        style={{
          background: `linear-gradient(145deg, ${theme.inverse}, ${theme.inverseMid} 60%, ${theme.inverseLight})`,
          borderRadius: 10,
          padding: "28px 24px",
          margin: "36px 0 28px",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          The Verdict
        </div>
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 19,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.5,
            color: theme.surface,
            marginBottom: 16,
          }}
        >
          The market isn't punishing "accounting SaaS."<br />
          It's punishing expensive stocks with unproven bets and thin geographic moats.
        </div>
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 15,
            lineHeight: 1.65,
            color: theme.textTertiary,
          }}
        >
          Intuit is what happens when a company enters a storm with ballast — a compressed valuation, dominant market share, and diversified revenue. Xero is what happens when you enter it at peak altitude, carrying a $2.5 billion acquisition you haven't proven, targeting a market where the incumbent is entrenched. Same sector. Same storm. Fundamentally different aircraft.
        </div>
      </div>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Sources */}
      <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme.textTertiary,
            marginBottom: 8,
          }}
        >
          Sources & Data
        </div>
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 12,
            lineHeight: 1.7,
            color: theme.textTertiary,
          }}
        >
          Market data from Feb 3, 2026 onwards. Yahoo Finance, Bloomberg, Morningstar, Trefis, Simply Wall St, company filings, ASX announcements. Xero H1 FY26 results, Intuit Q1 FY26 earnings. Analyst reports from JPMorgan, Oppenheimer, KeyCorp. Not financial advice.
        </div>
      </div>
    </article>
  );
}

/* ─── Article registry (maps id → component) ─── */
const ARTICLE_COMPONENTS = {
  "xero-vs-intuit": XeroVsIntuitArticle,
};

/* ─── Analysis List Card ─── */

function AnalysisCard({ analysis, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        background: hovered ? theme.surfaceAlt : theme.surface,
        border: `1px solid ${hovered ? theme.borderStrong : theme.border}`,
        borderRadius: 10,
        padding: "22px 20px",
        transition: "all 0.15s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: ACCENT,
            fontWeight: 700,
          }}
        >
          {analysis.sector}
        </span>
        <span style={{ color: theme.border }}>·</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: theme.textTertiary,
          }}
        >
          {analysis.date}
        </span>
        <span style={{ color: theme.border }}>·</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: theme.textTertiary,
          }}
        >
          {analysis.readTime}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.25,
          color: theme.text,
          marginBottom: 6,
        }}
      >
        {analysis.title}
      </div>
      <div
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: 14,
          lineHeight: 1.5,
          color: theme.textMuted,
          marginBottom: 14,
        }}
      >
        {analysis.subtitle}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {analysis.tickers.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 4,
              background: theme.surfaceAlt,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
            }}
          >
            {t}
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 22,
              fontWeight: 700,
              color: theme.text,
            }}
          >
            {analysis.heroStat.value}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: theme.textTertiary,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {analysis.heroStat.label}
          </span>
        </span>
      </div>
    </button>
  );
}

/* ─── Main Section ─── */

export default function AnalysisSection() {
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    const ArticleComponent = ARTICLE_COMPONENTS[selectedId];
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: theme.textMuted,
            padding: "0 0 20px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>←</span> All analyses
        </button>
        {ArticleComponent ? <ArticleComponent /> : null}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: theme.textMuted,
            marginBottom: 8,
          }}
        >
          Analysis
        </div>
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 14,
            color: theme.textTertiary,
            lineHeight: 1.5,
          }}
        >
          Deep dives into specific questions the data raises. Each piece uses only post-Feb 3 market data and public filings.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ANALYSES.map((a) => (
          <AnalysisCard key={a.id} analysis={a} onClick={() => setSelectedId(a.id)} />
        ))}
      </div>
    </div>
  );
}
