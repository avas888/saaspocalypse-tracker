// Auto-extracted from saaspocalypse_smb_analysis.jsx
import { SECTOR_COLORS } from "./atoms/tokens/palette.js";

const SECTORS_RAW = [
  {
    id: "crm",
    name: "CRM & Sales",
    icon: "📊",
    severity: "catastrophic",
    avgDrop: -42,
    thesis: "The poster child of the per-seat model. If one AI agent handles a pipeline of 50 accounts, you don't need 50 Salesforce licenses. No regulatory moat. No compliance shield. Pure UI wrapper on a database — exactly what Nadella called 'dead.'",
    moat: "Low",
    seatExposure: "Extreme",
    regulatoryShield: "None",
    companies: [
      { name: "HubSpot", ticker: "HUBS", drop: -51, status: "public", note: "Worst-hit CRM. SMB focus = low switching costs. Customers can leave overnight.", analystDetail: {
        consensus: "Strong Buy", targetMedian: "$590", targetRange: "$450–$800", analystCount: 34,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Bernstein calls current valuation a 'compelling risk-reward profile' at all-time-low multiples (~4.3x forward revenue). Revenue still growing 21% YoY with 84% gross margins. BTIG notes 'pricing in CRM's demise' is far too bearish.",
        bearCase: "BMO cut target to $385 citing SMB spending concerns. Net revenue retention flat at 103%. Seat-based pricing is structurally vulnerable — KeyBanc flagged HUBS as 'most exposed' to AI agent displacement.",
        verdict: "MOSTLY HYPE — The 51% drop prices in disruption that hasn't materialized in financials. Revenue growth is accelerating, not decelerating. But the per-seat model IS genuinely vulnerable long-term. Current price overshoots the real near-term risk.",
        sentiment: "green"
      }},
      { name: "monday.com", ticker: "MNDY", drop: -50, status: "public", note: "From $342 to ~$87. Launching AI Credits to replace seats. 21% single-day crash after earnings.", analystDetail: {
        consensus: "Buy", targetMedian: "$180", targetRange: "$120–$350", analystCount: 22,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Jan 2026",
        bullCase: "Pivoting from per-seat to consumption-based AI Credits shows awareness of the threat. Work OS spans CRM + PM — breadth could be defensive. Revenue still growing ~30%.",
        bearCase: "KeyBanc names monday.com as one of the three 'most exposed' seat-based companies alongside Asana and Sprout Social. No anchor system of record. Not yet a multiproduct platform. The pivot to AI Credits is an admission the old model is broken.",
        verdict: "REAL ECONOMICS + HYPE — The 50% drop reflects both genuine structural vulnerability (pure seat-based, no moat) AND panic overshooting. The AI Credits pivot is promising but unproven. High risk, high reward.",
        sentiment: "yellow"
      }},
      { name: "Salesforce", ticker: "CRM", drop: -42, status: "public", note: "52-week low ~$196. Agentforce adoption disappointing. Existential: agents pull from Gmail/Slack directly.", analystDetail: {
        consensus: "Moderate Buy", targetMedian: "$327", targetRange: "$250–$400", analystCount: 42,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "BTIG's Verkhovski says market is 'pricing in CRM's demise.' Agentforce hit $540M ARR (up 330%). Rule of 40 now met (33% margins + 11% growth). Forward P/E of 19.5x is historically cheap for Salesforce.",
        bearCase: "Seeking Alpha analyst rates Hold — Agentforce is only ~3.5% of total revenue from a 'small, unproven base.' Core growth stuck at single digits. Risk: if AI agents pull customer context from Gmail/Slack directly, the CRM becomes redundant.",
        verdict: "MIXED — The existential question is real (do you need a CRM if agents aggregate context from existing channels?), but Salesforce has $60B in remaining performance obligations and massive enterprise lock-in. The stock is cheap for the first time in a decade, but the long-term thesis is genuinely uncertain.",
        sentiment: "yellow"
      }},
      { name: "Pipedrive", ticker: "private", drop: null, status: "private", note: "Acquired by Vista Equity. SMB European CRM. Same existential risk, shielded from public panic." },
      { name: "Freshworks", ticker: "FRSH", drop: -10, status: "public", note: "Piper Sandler downgrade citing 'seat compression and vibe coding.' Indian-origin, NASDAQ-listed." },
      { name: "Zoho CRM", ticker: "private", drop: null, status: "private", note: "100M+ users. CEO called AI 'the pin popping this inflated balloon.' Private = no stock panic." },
    ],
    keyInsight: "CRM is the most exposed vertical because it embodies everything AI agents threaten: per-seat pricing, no regulatory requirements, general-purpose workflows, and data that agents can access directly from email and calendars. The more 'horizontal' and 'general purpose' the tool, the worse the punishment. HubSpot's SMB customers have the lowest switching costs, which is why it's hit even harder than Salesforce."
  },
  {
    id: "project",
    name: "Project Management",
    icon: "📋",
    severity: "catastrophic",
    avgDrop: -45,
    thesis: "UI wrappers on task databases — Nadella's 'CRUD apps' in their purest form. If an agent coordinates work, assigns tasks, and tracks progress, the visual interface is optional. SMB teams are the first to ditch the subscription.",
    moat: "Very Low",
    seatExposure: "Extreme",
    regulatoryShield: "None",
    companies: [
      { name: "Asana", ticker: "ASAN", drop: -59, status: "public", note: "-92% from ATH. The single most punished SaaS stock in the SaaSpocalypse.", analystDetail: {
        consensus: "Hold", targetMedian: "$17", targetRange: "$10–$22", analystCount: 15,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "TIKR: at 31x forward earnings with AI Studio and 'AI Teammates' launch, could see 71% upside over 4 years. NRR has 'hit bottom.' M&A target at ~$2.5B market cap — Oracle, Salesforce, or Adobe could acquire. CEO Moskovitz buying shares in open market.",
        bearCase: "RBC's Jaluria cut target to $10 (22% downside), flagging 'less prepared' companies. Revenue growth slowed from 30%+ to 9%. Microsoft Planner + Loop is a 'good enough' free alternative for M365 customers. HSBC downgraded on pricing pressure.",
        verdict: "MOSTLY REAL — Asana is the poster child of the 'CRUD app' thesis. Basic PM features are being commoditized by Microsoft and Google. The AI Studio pivot is a Hail Mary. At -92% ATH, the stock is either a deep value play or a value trap.",
        sentiment: "red"
      }},
      { name: "monday.com", ticker: "MNDY", drop: -50, status: "public", note: "Also in CRM — 'Work OS' spans both categories. Equally vulnerable in each." },
      { name: "Smartsheet", ticker: "SMAR", drop: -35, status: "public", note: "Spreadsheet-based PM. Highly commoditizable by any AI that can manage a to-do list.", analystDetail: {
        consensus: "Hold", targetMedian: "$30", targetRange: "$22–$42", analystCount: 12,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Spreadsheet-native interface is familiar and sticky for non-technical teams. Enterprise customers use it as a lightweight ERP. Revenue still growing ~15%.",
        bearCase: "The spreadsheet paradigm is exactly what AI agents replace — structured data + task management is trivially automatable. No regulatory moat. No hardware link. No unique data.",
        verdict: "MOSTLY REAL — Smartsheet sits in the 'commodity CRUD' zone. Its spreadsheet UI was an advantage when humans needed visual interfaces; it becomes a liability when agents manage data directly.",
        sentiment: "red"
      }},
      { name: "ClickUp", ticker: "private", drop: null, status: "private", note: "Raised $400M at $4B. Private = shielded from selloff but faces same existential risk." },
      { name: "Notion", ticker: "private", drop: null, status: "private", note: "Pivoting toward AI-native workspace. Better positioned than pure PM tools." },
    ],
    keyInsight: "Asana at -92% from its all-time high is the most extreme SaaSpocalypse casualty. Project management is the canonical 'CRUD app with a UI' that Nadella described. When an AI agent can create tasks, set deadlines, assign owners, and update status without a human ever opening a dashboard — the software becomes invisible. The private companies (ClickUp, Notion) face identical structural risk but are shielded from public market panic."
  },
  {
    id: "accounting",
    name: "SMB Accounting",
    icon: "🧾",
    severity: "moderate",
    avgDrop: -20,
    thesis: "Partial regulatory shield. Tax codes, GAAP/IFRS, country-specific filing requirements create real friction. But Nadella's thesis is precise: agents can DO the bookkeeping directly. The moat depends on geography — stronger in Brazil/Mexico than in the US.",
    moat: "Medium-High",
    seatExposure: "Medium",
    regulatoryShield: "High",
    companies: [
      { name: "Intuit (QBO)", ticker: "INTU", drop: -34, status: "public", note: "QuickBooks dominates US SMB (~62% share). P/E compressed 38% despite 12-13% revenue growth.", analystDetail: {
        consensus: "Strong Buy", targetMedian: "$800", targetRange: "$600–$971", analystCount: 37,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 9, 2026", bearCaseDate: "Feb 2026",
        bullCase: "Seeking Alpha upgraded to Buy (Feb 9) — calls the 50% selloff 'AI fear, not deteriorating fundamentals.' 2.8M customers already using AI agents for bookkeeping. Accounting agent saves customers 12 hours/month. Mizuho dismisses AI disruption for paid users. IRS Direct File threat defused by DOGE budget cuts.",
        bearCase: "AI could enable competitors to build 'good enough' bookkeeping tools quickly. TurboTax always at risk from government-run tax filing. Revenue growth guidance of 12-13% is a slowdown from 16%. Mailchimp acquisition still a drag.",
        verdict: "MOSTLY HYPE — Intuit is USING AI as a growth driver, not being disrupted by it. The 34% drop is multiple compression, not fundamental deterioration. QuickBooks' 62% SMB share + regulatory complexity (US tax code) creates real defensibility.",
        sentiment: "green"
      }},
      { name: "FreshBooks", ticker: "private", drop: null, status: "private", note: "Popular with freelancers/micro-businesses. Invoicing-centric — more vulnerable than full accounting." },
      { name: "Wave", ticker: "private", drop: null, status: "private", note: "Free accounting for micro-businesses. Owned by H&R Block. Revenue = payments, not seats." },
      { name: "Xero", ticker: "XRO.AX", drop: -16, status: "public", note: "NZ/Australia leader. Worst day since March 2020. Was trading at 102x earnings pre-crash.", analystDetail: {
        consensus: "Buy", targetMedian: "A$145", targetRange: "A$110–A$175", analystCount: 18,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Dominant in ANZ market with deep accountant-network integration. Making Tax Digital compliance in UK creates moat similar to Sage. Growing 20%+ in constant currency.",
        bearCase: "Was trading at an absurd 102x earnings pre-crash — the correction was overdue regardless of AI. Smaller scale than Intuit limits AI investment capacity. Less regulatory moat than LatAm peers.",
        verdict: "MOSTLY HYPE — Xero's drop is primarily a valuation reset from extreme multiples, compounded by SaaS sector sentiment. The underlying accounting business in ANZ/UK is well-protected by regulatory requirements.",
        sentiment: "green"
      }},
      { name: "Sage Group", ticker: "SGE.L", drop: -8, status: "public", note: "UK/Europe. Most resilient — Making Tax Digital in UK = moat. 10% organic growth." },
      { name: "TOTVS", ticker: "TOTS3.SA", drop: -15, status: "public", note: "Brazil leader (~50% market share). 27% ARR growth. Brazilian tax complexity = fortress.", analystDetail: {
        consensus: "Buy", targetMedian: "R$38", targetRange: "R$30–R$45", analystCount: 14,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "50% market share in Brazil with 27% ARR growth. Brazilian tax/labor regulation is among the most complex globally — no generic AI can handle it. Revenue diversifying into fintech (credit) and HR. ERP integration creates deep lock-in.",
        bearCase: "Brazil macro risk (currency, interest rates). Growth could slow as market saturates. International expansion limited by hyper-local specialization that gives it its moat.",
        verdict: "MOSTLY HYPE — TOTVS is one of the most misunderstood stocks in the SaaSpocalypse. Its -15% is pure contagion from the global SaaS selloff. Brazilian fiscal/labor complexity makes AI replacement borderline impossible for years.",
        sentiment: "green"
      }},
      { name: "CONTPAQi", ticker: "private", drop: null, status: "private", note: "Mexico leader. CFDI electronic invoicing compliance. SAT certification. Deep regulatory moat." },
      { name: "Nubox", ticker: "private", drop: null, status: "private", note: "Chile SMB accounting. Chilean tax compliance requirements. Private, locally entrenched." },
      { name: "Colppy", ticker: "private", drop: null, status: "private", note: "Argentina SMB accounting. AFIP compliance, inflation-adjusted bookkeeping. Hyper-local." },
      { name: "Bind ERP", ticker: "private", drop: null, status: "private", note: "Mexico (part of SUMA group). Cloud ERP for Mexican SMBs. SAT/CFDI integrated." },
      { name: "Zoho Books", ticker: "private", drop: null, status: "private", note: "Part of Zoho's 45+ app ecosystem. Aiming at SMBs globally. No public market exposure." },
      { name: "freee", ticker: "4478.T", drop: -12, status: "public", note: "Japan SMB accounting + payroll. Complex Japanese tax system = significant barrier for AI." },
    ],
    keyInsight: "The gradient within accounting is dramatic. US-centric tools like Intuit (-34%) are hit hard because US bookkeeping is relatively standardized — an AI can plausibly do it. But every step toward local regulatory complexity adds protection: Sage's Making Tax Digital compliance, TOTVS's Brazilian labor/tax integration, CONTPAQi's CFDI certification. The LatAm players are almost entirely private and deeply tied to country-specific fiscal requirements that generic AI can't yet handle."
  },
  {
    id: "payroll",
    name: "SMB Payroll & HR",
    icon: "💰",
    severity: "moderate",
    avgDrop: -18,
    thesis: "⚠️ CRITICAL DISTINCTION: Payroll stocks aren't falling because AI replaces payroll SOFTWARE. They're falling because AI replaces JOBS — and fewer employees means fewer paychecks to process. This is a macro employment fear, not a software disruption story. The software itself is arguably MORE necessary in a complex, AI-reshuffled labor market.",
    moat: "Very High",
    seatExposure: "Low",
    regulatoryShield: "Very High",
    companies: [
      { name: "Gusto", ticker: "private", drop: null, status: "private", note: "400K+ SMB customers. $9.5B valuation. 'People platform for Main Street.' US-focused, sticky." },
      { name: "Rippling", ticker: "private", drop: null, status: "private", note: "$13.5B valuation. HR + IT + payroll unified. 160+ countries. Fast-growing, shielded from selloff." },
      { name: "ADP (RUN)", ticker: "ADP", drop: -8, status: "public", note: "SMB product RUN. 50+ years dividends. 140 countries. Maximum regulatory moat.", analystDetail: {
        consensus: "Hold", targetMedian: "$310", targetRange: "$270–$350", analystCount: 25,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "50+ consecutive years of dividend increases. 140-country payroll compliance is unreplicable. RUN for SMBs is deeply embedded. Recession-resistant business model. Only -8% proves the moat is real.",
        bearCase: "Slow revenue growth (~6-7%). Premium valuation for a mature business. If AI significantly reduces employment levels over 5-10 years, the TAM (number of paychecks) genuinely shrinks.",
        verdict: "REAL ECONOMICS (but different thesis) — ADP's small drop is appropriate. The software isn't threatened, but the macro employment question is legitimate. This is a bet on how many humans will have jobs in 2030, not whether payroll software survives.",
        sentiment: "red"
      }},
      { name: "Paychex", ticker: "PAYX", drop: -12, status: "public", note: "~730K SMB clients. Benefits, HR, payroll bundle. Defensive, recession-resilient." },
      { name: "Paycom", ticker: "PAYC", drop: -41, status: "public", note: "Already sells outcomes (Beti automates payroll). Drop = macro fear, not disruption.", analystDetail: {
        consensus: "Hold", targetMedian: "$220", targetRange: "$155–$280", analystCount: 20,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Beti (employee self-service payroll) already automates the entire payroll run — Paycom is AHEAD of the AI curve, not behind it. Outcome-based pricing insulates from seat compression. Strong margin profile.",
        bearCase: "The -41% reflects the scariest version of the payroll thesis: if AI agents replace white-collar workers en masse, there are fewer employees to pay. Paycom's mid-market focus means its clients are precisely the companies most likely to cut headcount with AI.",
        verdict: "MIXED — Paycom's software is one of the most AI-forward in payroll (Beti literally lets employees run their own payroll). But the -41% drop reflects genuine macro employment fear, not software obsolescence. If you believe AI causes mass white-collar layoffs, Paycom's TAM shrinks. If not, it's dramatically oversold.",
        sentiment: "yellow"
      }},
      { name: "Paylocity", ticker: "PCTY", drop: -40, status: "public", note: "14% recurring revenue growth, 35.9% EBITDA margins. Raised revenue target $2B→$3B.", analystDetail: {
        consensus: "Buy", targetMedian: "$210", targetRange: "$155–$260", analystCount: 18,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Raised long-term revenue target from $2B to $3B. 35.9% EBITDA margins expanding. 14% recurring revenue growth with strong SMB retention. AI features being added to enhance the platform.",
        bearCase: "Same macro employment thesis as Paycom — fewer workers = fewer paychecks. SMB-focused, which is the segment most likely to use AI to reduce headcount aggressively.",
        verdict: "MOSTLY HYPE — The -40% drop is almost entirely macro sentiment, not software disruption. Paylocity's fundamentals are strong and improving. But the employment TAM question looms over the entire payroll sector.",
        sentiment: "green"
      }},
      { name: "Deel", ticker: "private", drop: null, status: "private", note: "Global payroll/EOR in 150+ countries. $12B valuation. Growing rapidly in distributed teams." },
      { name: "Personio", ticker: "private", drop: null, status: "private", note: "€8.5B. European SMB HR + payroll. EU labor law complexity = natural moat." },
      { name: "OnPay", ticker: "private", drop: null, status: "private", note: "Affordable US SMB payroll. Niche focus on farms, restaurants, nonprofits." },
      { name: "Square Payroll", ticker: "XYZ", drop: -15, status: "public", note: "Part of Block (formerly Square). Integrated with POS. Restaurant/retail focused." },
      { name: "CONTPAQi Nómina", ticker: "private", drop: null, status: "private", note: "Mexico. CFDI payroll timbrado (mandatory SAT certification). Impossible for generic AI." },
    ],
    keyInsight: "THIS IS THE MOST MISUNDERSTOOD SECTOR IN THE SAASPOCALYPSE. Every other vertical is falling because AI threatens to replace the SOFTWARE. Payroll is falling because AI threatens to replace the WORKERS who get paid through the software. That is a completely different thesis. Paycom at -41% and Paylocity at -40% look like CRM-level carnage — but the mechanism is opposite. The market is pricing in: 'If AI agents do the work of 5 humans, companies fire 4 humans, and there are 4 fewer paychecks to process.' It's a TAM-shrinkage fear, not a disruption fear. The payroll software itself becomes MORE critical, not less — you still need bulletproof tax compliance, labor law adherence, and multi-jurisdiction calculation for every remaining employee. ADP at -8% proves this: the incumbents with regulatory moats are barely scratched. Paycom already sells OUTCOMES (Beti automates the entire payroll run). Gusto, Rippling, and Deel are all private and growing aggressively. The bet against payroll software isn't that the software dies — it's that the addressable market (number of employed humans) shrinks. That's a real risk, but it's a 5-10 year macro question, not a 'software is dead next quarter' panic."
  },
  {
    id: "pos",
    name: "Restaurant POS",
    icon: "🍽️",
    severity: "low",
    avgDrop: -12,
    thesis: "Hardware + payments + operations = triple moat. You can't 'vibe code' a kitchen display system or payment terminal. POS is embedded in physical operations — orders, tips, inventory, labor. AI ENHANCES these platforms (menu optimization, demand forecasting) rather than replacing them.",
    moat: "Very High",
    seatExposure: "None",
    regulatoryShield: "Medium",
    companies: [
      { name: "Toast", ticker: "TOST", drop: -33, status: "public", note: "Restaurant-specific POS. $14B market cap. 25% YoY growth. AI for menu/labor analytics. Reports Feb 12.", analystDetail: {
        consensus: "Buy", targetMedian: "$45", targetRange: "$29–$65", analystCount: 22,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Seeking Alpha initiates Buy with $57 two-year target. 25% revenue growth + 30% EPS growth expected. ARR surpassed $2B. Transitioning from growth to profitability — now generating real free cash flow. Competitive moat widening as Clover struggles.",
        bearCase: "DA Davidson neutral at $36. Recession risk could hit restaurant spending. Hardware supply chain bottlenecks remain. Still relatively expensive for a fintech at 76x P/E. Earnings Feb 12 is key inflection.",
        verdict: "MOSTLY HYPE — Toast's -33% is SaaS-sector contagion, not AI disruption. You can't replace a kitchen display system with a chatbot. Revenue growing 25%, margins improving, and AI is being added as a FEATURE (menu analytics, labor forecasting), not displacing the product.",
        sentiment: "green"
      }},
      { name: "Block (Square)", ticker: "XYZ", drop: -15, status: "public", note: "POS + payments + payroll + lending. Hardware moat. Broad SMB ecosystem.", analystDetail: {
        consensus: "Buy", targetMedian: "$95", targetRange: "$70–$120", analystCount: 30,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Massive SMB ecosystem: POS + payments + payroll + lending + Cash App. Ecosystem lock-in across 4M+ sellers. Payment processing creates recurring revenue independent of software subscriptions.",
        bearCase: "Fintech competition intensifying. Cash App growth slowing. Multiple compression across all fintech. Bitcoin strategy adds volatility.",
        verdict: "MOSTLY HYPE — Block's -15% is fintech-sector multiple compression, not AI disruption. The payment processing + hardware combo is exactly the kind of physical-ops integration that AI can't replace.",
        sentiment: "green"
      }},
      { name: "Lightspeed", ticker: "LSPD", drop: -20, status: "public", note: "Restaurant + retail POS. Multi-location inventory. More volatile, smaller.", analystDetail: {
        consensus: "Hold", targetMedian: "$18", targetRange: "$12–$28", analystCount: 15,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Multi-location restaurant and retail POS with strong inventory management. International presence (HQ in Montreal). Payment processing revenue growing faster than subscriptions.",
        bearCase: "Smaller scale than Toast/Square limits competitive advantage. History of acquisitions that haven't fully integrated. Volatile stock with weak profitability track record.",
        verdict: "MIXED — Lightspeed benefits from the same POS defensibility as Toast, but smaller scale and weaker execution make it more vulnerable to competitive pressure from both Toast (restaurants) and Shopify (retail).",
        sentiment: "yellow"
      }},
      { name: "Clover (Fiserv)", ticker: "FI", drop: -5, status: "public", note: "Clover is Fiserv's SMB POS. Parent company is a $90B fintech giant — minimal SaaS exposure." },
      { name: "SpotOn", ticker: "private", drop: null, status: "private", note: "Restaurant POS challenger. Private. Staff scheduling + reservation integration." },
      { name: "Otter (DoorDash)", ticker: "DASH", drop: -8, status: "public", note: "Delivery aggregator + POS layer. Owned by DoorDash. Multi-channel order unification." },
      { name: "HungerRush", ticker: "private", drop: null, status: "private", note: "QSR/pizza focused POS. AI voice ordering for drive-thrus. Private." },
    ],
    keyInsight: "Restaurant POS is the anti-SaaSpocalypse. These companies are intertwined with physical operations: hardware terminals, kitchen displays, payment processing, tip management, inventory. You cannot replace a POS terminal with a chatbot. Toast's -33% drop overstates its vulnerability — it's mainly multiple compression from the overall tech selloff, not an existential threat. Toast is actually ADDING AI features (menu profitability analytics, labor forecasting) that make it stickier. Clover's parent Fiserv barely moved. The hardware link is the critical differentiator — AI enhances POS, it doesn't replace it."
  },
  {
    id: "hotel",
    name: "Hotel PMS",
    icon: "🏨",
    severity: "low",
    avgDrop: -5,
    thesis: "Hospitality's 'mission control.' Managing reservations, check-ins, housekeeping, channel distribution, payments, and compliance across hundreds of channels. Deeply operational, hardware-adjacent (key cards, kiosks), and mostly private companies. AI is an ACCELERANT here, not a threat.",
    moat: "High",
    seatExposure: "Low",
    regulatoryShield: "Medium",
    companies: [
      { name: "Cloudbeds", ticker: "private", drop: null, status: "private", note: "All-in-one PMS for independents. 157 countries. Launched 'Signals' AI for demand forecasting." },
      { name: "Mews", ticker: "private", drop: null, status: "private", note: "Raised $300M at $2.5B (Jan 2026). 12,500 properties. Largest-ever hotel PMS round." },
      { name: "Guesty", ticker: "private", drop: null, status: "private", note: "Short-term rental PMS. Multi-channel (Airbnb, VRBO, Booking.com). Raised $170M." },
      { name: "Apaleo", ticker: "private", drop: null, status: "private", note: "API-first PMS. First to launch AI agent marketplace. €20M raised. Modular approach." },
      { name: "StayNTouch", ticker: "private", drop: null, status: "private", note: "Mobile-first PMS. AWS-hosted. 100% uptime focus. Contactless check-in." },
      { name: "Agilysys", ticker: "AGYS", drop: -10, status: "public", note: "Only major public PMS pure-play. $150M spa acquisition. Mostly enterprise but SMB push.", analystDetail: {
        consensus: "Buy", targetMedian: "$130", targetRange: "$100–$160", analystCount: 8,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Only publicly-traded PMS pure-play — rare exposure to hospitality tech. $150M spa/resort acquisition expands TAM. Recurring revenue growing. Enterprise hotel chains are sticky multi-year contracts.",
        bearCase: "Small company ($2B market cap) in a niche sector. Enterprise-focused, limited SMB traction. Hospitality is cyclical and recession-sensitive.",
        verdict: "MOSTLY HYPE — The -10% is broad tech selloff, not AI-specific. Hotel PMS is one of the most defensible SaaS categories. Agilysys's enterprise contracts and vertical specialization make it nearly immune to vibe-coding displacement.",
        sentiment: "green"
      }},
    ],
    keyInsight: "Hotel PMS is arguably the SAFEST sector in this analysis. Nearly all players are private (immune to public panic). The sector just saw its largest-ever funding round (Mews at $2.5B). AI is being adopted as a feature, not a threat — Mews's 'agentic AI' vision has agents adjusting pricing, reallocating housekeeping, and personalizing guest communications WITHIN the PMS. The physical operations link (key cards, kiosks, housekeeping coordination) makes replacement by generic AI implausible. The market is growing at 7% CAGR to $2.4B by 2031."
  },
  {
    id: "document",
    name: "Document & E-Sign",
    icon: "📄",
    severity: "severe",
    avgDrop: -38,
    thesis: "Thin workflow layers. E-signatures, contract management, and document routing are classic automation targets. If an AI agent generates, routes, and tracks a contract, the standalone tool disappears. Low regulatory moat despite the legal-adjacent positioning.",
    moat: "Low",
    seatExposure: "High",
    regulatoryShield: "Low",
    companies: [
      { name: "DocuSign", ticker: "DOCU", drop: -52, status: "public", note: "-85% from ATH. E-signature is a thin layer — AI generates AND routes the document.", analystDetail: {
        consensus: "Hold", targetMedian: "$85", targetRange: "$76–$124", analystCount: 17,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Trading at 54% discount to intrinsic value estimates. Intelligent Agreement Management (IAM) platform could expand TAM to $50B. 36.5% profit margin. $1.5B buyback program. Revenue growing 8% despite headwinds.",
        bearCase: "RBC's Jaluria cut target citing AI disruption. CEO personally sold $1.87M in shares. OpenAI's DocuGPT caused 17% single-day drop. Billings outlook slashed due to go-to-market transition. E-signature is becoming a commodity feature, not a standalone product.",
        verdict: "MOSTLY REAL — DocuSign's core thesis IS under genuine threat. E-signatures are a thin wrapper that AI agents can subsume. The IAM pivot is smart but unproven. The -85% ATH drop includes some overshooting, but the structural risk is real — e-sign is becoming a feature, not a company.",
        sentiment: "red"
      }},
      { name: "PandaDoc", ticker: "private", drop: null, status: "private", note: "SMB proposal/contract tool. Private. Faces same commoditization risk." },
      { name: "Dropbox Sign", ticker: "DBX", drop: -25, status: "public", note: "Formerly HelloSign. Part of Dropbox. Storage moat helps but e-sign is vulnerable.", analystDetail: {
        consensus: "Hold", targetMedian: "$28", targetRange: "$22–$35", analystCount: 10,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Dropbox's storage business provides a floor — e-sign is just one product. Deep integration with document storage creates workflow value. Strong free cash flow generation.",
        bearCase: "Storage is also under pressure from AI assistants that manage files. E-sign feature within Dropbox faces same commoditization as DocuSign. User growth has stalled.",
        verdict: "MOSTLY REAL — Dropbox Sign is a secondary product inside a company whose primary business (cloud storage) is also under AI pressure. Double vulnerability.",
        sentiment: "red"
      }},
    ],
    keyInsight: "DocuSign at -85% from its all-time high tells the story. E-signatures are the canonical 'thin wrapper' — a feature, not a product. When AI agents can draft, negotiate, and execute agreements end-to-end, the standalone e-signature tool has no reason to exist as an independent subscription. The lack of regulatory requirements (unlike payroll or accounting) leaves no defensive moat."
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Retail SaaS",
    icon: "🛒",
    severity: "moderate",
    avgDrop: -15,
    thesis: "Mixed bag. Shopify has deep merchant lock-in + payments + hardware (POS terminals). But lighter tools (website builders, marketing automation) face commoditization from AI that can 'vibe code' a storefront.",
    moat: "Medium-High",
    seatExposure: "Low",
    regulatoryShield: "Low",
    companies: [
      { name: "Shopify", ticker: "SHOP", drop: -18, status: "public", note: "Merchant ecosystem + payments + shipping + POS hardware. Relatively defensive for SMB SaaS.", analystDetail: {
        consensus: "Buy", targetMedian: "$120", targetRange: "$85–$150", analystCount: 35,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Full merchant operating system — payments, shipping, POS hardware, lending, fulfillment. AI features (Shopify Magic) enhance the platform. GMV growing 20%+. Ecosystem lock-in is deeper than any pure SaaS company.",
        bearCase: "Premium valuation (~60x earnings). AI can create storefronts from a prompt, commoditizing the 'template' layer. Amazon and TikTok Shop creating alternative channels. Macro sensitivity to consumer spending.",
        verdict: "MOSTLY HYPE — Shopify's -18% is sector contagion. The commerce platform (payments + shipping + POS) is deeply embedded in physical operations. AI-generated storefronts threaten the template layer, not the operational backbone. One of the most defensible positions in SMB SaaS.",
        sentiment: "green"
      }},
      { name: "BigCommerce", ticker: "BIGC", drop: -30, status: "public", note: "Smaller competitor. Less ecosystem lock-in than Shopify. More vulnerable.", analystDetail: {
        consensus: "Hold", targetMedian: "$8", targetRange: "$5–$12", analystCount: 10,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Enterprise-focused with headless commerce architecture. B2B e-commerce capabilities. Recent cost-cutting improving margins. Could be M&A target.",
        bearCase: "Distant #2 to Shopify with no path to matching ecosystem scale. Enterprise deals have long sales cycles. Headless commerce can be replicated by AI-generated frontends.",
        verdict: "MOSTLY REAL — BigCommerce lacks Shopify's ecosystem moat. Without payments + shipping + POS lock-in, it's closer to a 'template tool' that AI can replace. Scale disadvantage compounds the AI vulnerability.",
        sentiment: "red"
      }},
      { name: "Wix", ticker: "WIX", drop: -25, status: "public", note: "Website builder + e-commerce. AI can now build sites from a prompt — direct threat.", analystDetail: {
        consensus: "Buy", targetMedian: "$210", targetRange: "$160–$270", analystCount: 16,
        consensusDate: "Feb 2026", bullCaseDate: "Feb 2026", bearCaseDate: "Feb 2026",
        bullCase: "Strong profitability pivot — GAAP profitable with expanding margins. 600M+ users globally. AI Site Builder actually helps Wix acquire customers faster. Payment solutions growing.",
        bearCase: "AI vibe coding is an existential threat to drag-and-drop site builders. Why pay $30/month for templates when Claude/GPT can generate a site from a text prompt? The core product (visual website builder) is the most AI-replaceable.",
        verdict: "REAL ECONOMICS — Wix's core product (drag-and-drop website builder) is squarely in the crosshairs of vibe coding. A $30/month subscription for templates loses its value when AI generates professional sites for free. The payments/commerce layer provides some defense, but the template business is structurally threatened.",
        sentiment: "red"
      }},
      { name: "Squarespace", ticker: "SQSP", drop: -20, status: "public", note: "Design-focused sites. Went private via Permira buyout 2024. Re-listed. Vulnerable to vibe coding." },
      { name: "VTEX", ticker: "VTEX", drop: -15, status: "public", note: "LatAm e-commerce platform. Regional focus provides some protection." },
    ],
    keyInsight: "Shopify is the standout because it's become a full operating system for merchants — not just a storefront but payments, shipping, POS hardware, lending, and fulfillment. That ecosystem creates genuine lock-in. But the lighter website builders (Wix, Squarespace) face real pressure from 'vibe coding' — if an AI can create a professional storefront from a text prompt, a $30/month subscription for drag-and-drop templates loses its value proposition."
  }
];

export const SECTORS = SECTORS_RAW.map((s) => ({
  ...s,
  color: SECTOR_COLORS[s.id] ?? "#78716C",
}));
