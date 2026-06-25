import type { Edition } from "./types";

// Shared coordinates for recurring flashpoint locations.
const GEO = {
  hormuz: { lat: 26.57, lng: 56.25 },
  tehran: { lat: 35.69, lng: 51.39 },
  islamabad: { lat: 33.69, lng: 73.06 },
  kabul: { lat: 34.55, lng: 69.21 },
  nakhchivan: { lat: 39.21, lng: 45.41 },
  kl: { lat: 3.14, lng: 101.69 },
  seoul: { lat: 37.57, lng: 126.98 },
  washington: { lat: 38.9, lng: -77.04 },
  beijing: { lat: 39.9, lng: 116.4 },
  moscow: { lat: 55.75, lng: 37.62 },
  uae: { lat: 25.2, lng: 55.27 },
  bahrain: { lat: 26.07, lng: 50.56 },
  brussels: { lat: 50.85, lng: 4.35 },
  madrid: { lat: 40.42, lng: -3.7 },
  qatar: { lat: 25.9, lng: 51.53 },
  oman: { lat: 23.59, lng: 58.41 },
  beirut: { lat: 33.89, lng: 35.5 },
};

// ── 06 MARCH 2026 · EDITION 002 · DAY 7 OF WAR ──────────────────────────────
const ed_0306: Edition = {
  id: "2026-03-06",
  editionNo: "002",
  date: "2026-03-06",
  dateLabel: "06 MAR 2026",
  subtitle: "Day 7 of War",
  operation: "Operation Epic Fury — Active Combat",
  threatLevel: "CRITICAL",
  location: "Kuala Lumpur, MY",
  headline:
    "Operation Epic Fury enters week 2 — NATO drawn in — BTC bounces — Gold holds $5,079",
  tickers: [
    { label: "Threat Level", value: "CRITICAL", tone: "alert" },
    { label: "Gold", value: "$5,079", tone: "warn" },
    { label: "BTC", value: "$70,900", sub: "+11% / 5D", tone: "up" },
    { label: "Brent Oil", value: "$84.32", sub: "-1.3% day", tone: "down" },
    { label: "War Day", value: "7", tone: "alert" },
  ],
  summary: [
    {
      rank: 1,
      title: "Day 7 — NATO is now in the war",
      severity: "CRITICAL",
      tags: ["GEOPOLITICS", "NATO"],
      confidence: "HIGH",
      body:
        "France authorized US use of French military bases (BFMTV confirmed). UK withdrawing embassy staff Bahrain. Italy sent defensive weapons to Gulf but called war 'illegal.' Spain denied US base use → Trump threatened economic retaliation. No longer a US-Israel bilateral operation — it is metastasizing into a NATO-adjacent conflict.",
    },
    {
      rank: 2,
      title: "Iran widened attack — Azerbaijan struck",
      severity: "CRITICAL",
      tags: ["ESCALATION"],
      confidence: "HIGH",
      body:
        "Iran struck Azerbaijan for the first time — drones hit Nakhchivan International Airport and fell near a school in Shakarabad. Azerbaijan borders Russia; any Russian response could trigger Article 5 / CSTO concerns. First time Iranian drones entered ex-Soviet airspace during this conflict.",
    },
    {
      rank: 3,
      title: "AWS data centers hit in UAE and Bahrain",
      severity: "CRITICAL",
      tags: ["CLOUD", "INFRASTRUCTURE"],
      confidence: "HIGH",
      body:
        "Amazon confirmed its UAE data center was 'impacted by objects that struck it, resulting in sparks and fire.' Gulf digital infrastructure is now a war target. First confirmed strike on major Western cloud infrastructure in any conflict — implications for AI compute, digital banking, and e-commerce across MEA.",
    },
    {
      rank: 4,
      title: "Gold $5,079 — stagflation regime confirmed",
      severity: "HIGH",
      tags: ["MARKETS", "GOLD"],
      body:
        "Gold and 10-year Treasury yields both rising simultaneously — the classic stagflation signal. Fed summer rate cut probability has 'evaporated' per CME FedWatch. Markets pricing higher-for-longer potentially through Sep 2026. Newmont (NEM) and Barrick (GOLD) sharply outperforming.",
    },
    {
      rank: 5,
      title: "Bitcoin +11% in 5 days — KOSPI capital rotation",
      severity: "HIGH",
      tags: ["CRYPTO"],
      body:
        "BTC bounced from $60K cycle low to $70,900. Key catalyst: South Korean KOSPI lost 20% in 5 days as $13.7B in foreign outflows hit in February. Capital rotating from KOSPI into crypto. Fear & Greed still at 14 (Extreme Fear) = contrarian signal.",
    },
  ],
  geopolitics: [
    {
      id: "iran-war-d7",
      title: "IRAN WAR — DAY 7 (Operation Epic Fury)",
      status: "ACTIVE COMBAT",
      severity: "CRITICAL",
      region: "Middle East",
      ...GEO.tehran,
      body:
        "US struck ~2,500 targets in 7 days ($891M/day — CSIS). Israel claims 80% of Iran air defence destroyed. Iran launched 500 missiles + 2,000 drones across 9 countries. Iran death toll 1,230–1,400+ confirmed. Supreme Leader succession unclear; Mojtaba Khamenei emerging.",
    },
    {
      id: "hormuz-siege",
      title: "STRAIT OF HORMUZ — SIEGE CONTINUES",
      status: "CLOSED",
      severity: "CRITICAL",
      region: "Persian Gulf",
      ...GEO.hormuz,
      body:
        "20% of global oil at risk. Maersk suspension of Hormuz transit ongoing. Iranian tanker IRIS Bushehr interned by Sri Lanka. Trump confirmed '4-week timetable.' If Hormuz stays closed 4 weeks: Goldman models $90–120/bbl.",
    },
    {
      id: "azerbaijan-strike",
      title: "AZERBAIJAN — CSTO ACTIVATION RISK",
      status: "ESCALATING",
      severity: "HIGH",
      region: "Caucasus",
      ...GEO.nakhchivan,
      body:
        "Iranian drones hit Nakhchivan. Azerbaijan is NOT NATO but has a NATO partnership; Russia borders it. Worst case: involve Russian CSTO forces if Azerbaijan invokes the treaty against Iran. Confidence: LOW-MEDIUM but the trigger exists.",
    },
    {
      id: "pak-malay-coord",
      title: "PM SHAHBAZ–ANWAR CALL — OIC SOFT-POWER BLOC",
      status: "DIPLOMACY",
      severity: "MEDIUM",
      region: "Asia",
      ...GEO.islamabad,
      body:
        "PM Shahbaz Sharif called Malaysian PM Anwar and Indonesian President Widodo to coordinate Middle East response. Pakistan-Malaysia-Indonesia = Muslim-majority OIC bloc forming a coordinated soft-power position. May create a non-aligned bloc that China courts.",
    },
    {
      id: "aws-gulf",
      title: "GULF CLOUD INFRASTRUCTURE STRUCK",
      status: "ACTIVE",
      severity: "HIGH",
      region: "UAE / Bahrain",
      ...GEO.uae,
      body:
        "AWS UAE + Bahrain data centers struck. Iran systematically attempting to degrade Western digital infrastructure in the Gulf. Second-order: cloud companies accelerate diversification from Gulf to Malaysia/Singapore.",
    },
  ],
  markets: [
    { asset: "Gold (XAU/USD)", price: "$5,079", change: "-6.3% fr ATH", tone: "warn", signal: "HOLD / ACCUMULATE on dips", keyLevel: "Support: $5,000" },
    { asset: "Bitcoin (BTC)", price: "$70,900", change: "+11% / 5D", tone: "up", signal: "CAUTION-BULLISH: cycle bottom signal", keyLevel: "Resistance: $79K" },
    { asset: "Brent Crude", price: "$84.32", change: "+7% since war", tone: "alert", signal: "ELEVATED: Hormuz risk premium", keyLevel: "Bull: $90-120" },
    { asset: "WTI Crude", price: "~$79", change: "tracks Brent", tone: "warn", signal: "Watch Hormuz status", keyLevel: "Brent −$4-5" },
    { asset: "S&P 500", price: "6,831", change: "-0.6% today", tone: "down", signal: "Under pressure: rates + oil", keyLevel: "Support: 6,700" },
    { asset: "10Y UST Yield", price: "4.10%", change: "rising w/ gold", tone: "warn", signal: "Stagflation regime — RARE", keyLevel: "Watch: 4.25%" },
    { asset: "DXY (USD)", price: "~98-99", change: "Strong", tone: "up", signal: "War safe-haven + rates hold" },
    { asset: "Gold/Silver", price: "High", change: "Silver lagging", tone: "flat", signal: "Silver asymmetric upside", keyLevel: "UBS: $58-60" },
  ],
  centralBanks: [
    { name: "Federal Reserve", stance: "HOLD", rate: "4.25-4.50%", tone: "alert", note: "Summer cut probability evaporated per CME FedWatch. Higher-for-longer through Sep 2026." },
    { name: "ECB", stance: "HOLD/WATCH", rate: "~2.50%", tone: "warn", note: "Oil shock risks pushing already-sticky inflation higher vs weakening growth." },
    { name: "Bank Negara (MY)", stance: "HOLD", rate: "2.75%", tone: "alert", note: "All 24 Bloomberg economists expect hold. Last move was a cut in Jul 2025." },
    { name: "State Bank (PK)", stance: "HOLD", rate: "10.5%", tone: "alert", note: "96% of market expects hold Mar 9. Oil shock + geopolitics override rate-cut appetite." },
  ],
  regional: [
    {
      country: "Pakistan",
      flag: "🇵🇰",
      tag: "DIRECT IMPACT",
      metrics: [
        { label: "SBP Rate", value: "10.5%", sub: "HOLD Mar 9", tone: "warn" },
        { label: "Remittances", value: "$38B", sub: "FY25 record", tone: "up" },
        { label: "Diaspora", value: "AT RISK", sub: "3 killed UAE", tone: "alert" },
        { label: "GDP", value: "2.5-3%", sub: "ADB FY25-26", tone: "flat" },
      ],
      analysis: [
        "Diaspora workers in Gulf under Iranian strikes — 3 Pakistanis confirmed killed in UAE strikes. CRITICAL threat.",
        "Gulf remittances ($38B record) = primary forex lifeline. If workers evacuate or are killed, FX cover erodes.",
        "Pakistan imports 80% crude — every $10 increase = ~$1.5B current account hit. Hormuz closure is the #1 risk.",
        "Shahbaz-Anwar call strategically significant: Pakistan positioning as Muslim-world diplomatic voice, not a combatant. Could open OIC-mediated negotiations.",
      ],
    },
    {
      country: "Malaysia",
      flag: "🇲🇾",
      tag: "OIL WINDFALL",
      metrics: [
        { label: "BNM Rate", value: "2.75%", sub: "HOLD", tone: "warn" },
        { label: "GDP 2026", value: "4.3%", sub: "IMF forecast", tone: "up" },
        { label: "Ringgit", value: "RM 3.89", sub: "strengthened", tone: "up" },
        { label: "Petronas", value: "NET EXPORTER", sub: "+$1-2B/$10 oil", tone: "up" },
      ],
      analysis: [
        "Malaysia is a NET oil exporter — Brent $84 vs $79 pre-war. Each sustained $10 above baseline adds ~$1-2B to Petronas revenues.",
        "Becoming SEA's AI infrastructure hub — Microsoft, Google, Amazon building. Johor-Singapore corridor = data centre cluster.",
        "Aviation under pressure: AirAsia, Malaysia Airlines Middle East routes disrupted; war-risk insurance premiums surging.",
        "Arguably the most favorably positioned mid-size economy: oil upside, China+1 FDI, AI buildout, political stability, geopolitical neutrality premium.",
      ],
    },
  ],
  weakSignals: [
    { title: "AWS Gulf data centers struck", risk: "CRITICAL", body: "Cloud infrastructure now a war target. Every AI company, fintech, and enterprise running on Gulf nodes is affected. Watch Azure/Google Cloud Gulf status." },
    { title: "Spain defies Trump — EU fracture", risk: "HIGH", body: "Spain denied US base access → Trump threatened economic retaliation. Reveals a deep EU split; weakens US diplomatic leverage and emboldens Iran to outlast the offensive." },
    { title: "Azerbaijan entry — CSTO activation risk", risk: "MEDIUM", body: "Iranian drones hit Nakhchivan. Russia borders Azerbaijan. A worst-case path could pull in Russian CSTO forces. The trigger exists." },
    { title: "South Korean KOSPI → crypto rotation", risk: "MEDIUM", body: "KOSPI lost 20% in 5 days; $13.7B foreign outflows. Korean retail rotating displaced capital into BTC — a clean leading indicator." },
    { title: "AI-generated content flood", risk: "MEDIUM", body: "Fake videos of missiles destroying Tel Aviv going viral. First major AI disinformation event in a Great-Power-adjacent conflict. Verification infrastructure breaking down." },
  ],
  opportunities: [
    { asset: "Gold (XAU/USD)", action: "STRONG BUY", horizon: "SHORT-LONG", confidence: "HIGH", body: "Target $5,400 (retest ATH) then $5,600-6,000 if war persists. Stagflation + war + central bank buying = multi-factor alignment. Vehicles: physical, GLD, SGOL, PAXG, NEM/GOLD/AEM." },
    { asset: "Malaysia KLCI Energy + Data Centre REITs", action: "TACTICAL BUY", horizon: "SHORT-MED", confidence: "MED-HIGH", body: "Petronas-linked names benefit from Brent $84+. MYR strengthening. Data centre REITs with Johor-Singapore corridor exposure (hyperscaler tenants)." },
    { asset: "Bitcoin (accumulate dip)", action: "WATCH", horizon: "MEDIUM", confidence: "MEDIUM", body: "Accumulation zone $62,300-$70,000. DCA into this zone. Weekly close above $83,737 = confirmed trend reversal. Abu Dhabi SWF adding via ETFs = institutional floor." },
    { asset: "Silver — asymmetric metals", action: "BUY ON DIPS", horizon: "MED-LONG", confidence: "MEDIUM", body: "Gold-silver ratio historically elevated = silver undervalued. UBS target $58-60. 5th consecutive year of supply deficit. SLV/PSLV for paper; physical for conviction." },
    { asset: "Defense stocks globally", action: "BUY", horizon: "SHORT-LONG", confidence: "HIGH", body: "Active war = defense spending surge. Europe rearming. LMT, RTX, BAE, Rheinmetall (Germany, surging), Elbit. 3-5 years of tailwind." },
    { asset: "Airlines / Aviation", action: "AVOID", horizon: "SHORT", confidence: "HIGH", body: "United -4.2%, Air France -9.4%, Lufthansa -5.2%. Dubai air hub effectively closed. Middle East route suspensions extending." },
  ],
  predictions: [
    { horizon: "1 WEEK", event: "Iran War", prediction: "Strikes continue. Israel moves to 'next phase.' No negotiation — FM Araghchi rejected talks.", confidence: "HIGH", status: "ACTIVE" },
    { horizon: "1 WEEK", event: "Hormuz", prediction: "Remains disrupted. Maersk suspension ongoing. Trump 4-week timetable = Hormuz risk until ~Mar 28.", confidence: "HIGH", status: "ACTIVE" },
    { horizon: "1 WEEK", event: "Gold", prediction: "$5,000–$5,300 consolidation range. Bullish bias on any Iran escalation.", confidence: "HIGH", status: "BULLISH" },
    { horizon: "1 WEEK", event: "Bitcoin", prediction: "$62K–$80K range. Bounce continuing. $79K weekly close = trend confirmation.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "1 MONTH", event: "Iran Regime", prediction: "Leadership vacuum deepens. Mojtaba Khamenei likely new Supreme Leader. IRGC controls interim.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "1 MONTH", event: "Pakistan", prediction: "Oil shock threatens IMF program. UAE $1B swap deal at risk if Gulf disrupted. Monitor PKR weekly.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "3 MONTHS", event: "Gold", prediction: "$5,400–6,000 scenario if war persists and central bank buying continues.", confidence: "MEDIUM", status: "BULLISH" },
    { horizon: "12 MONTHS", event: "World Order", prediction: "US unilateralism + NATO fragmentation + China opportunism = fastest restructuring since 1991.", confidence: "HIGH", status: "ACTIVE" },
  ],
  analystNote:
    "Yesterday's brief said 'the single most important variable is Strait of Hormuz status.' That remains true — but today adds a second equal variable: NATO coherence. Spain defying Trump and Iran hitting Azerbaijan are the two developments that most changed the risk calculus. A fragmented NATO reduces US operational leverage while Iran gains diplomatic breathing room. MONEY PLAY: gold is the cleanest trade — every complication is gold-bullish. MALAYSIA CALL: KLCI energy + data centre infrastructure is the highest-conviction regional trade for someone based in Kuala Lumpur.",
  sources: ["Al Jazeera", "CNN", "Wikipedia", "Gulf News", "CoinDesk", "ADB", "Dawn", "IMF", "CSIS"],
};

// ── 07 MARCH 2026 · EDITION 066 · DAY 8 OF WAR ──────────────────────────────
const ed_0307: Edition = {
  id: "2026-03-07",
  editionNo: "066",
  date: "2026-03-07",
  dateLabel: "07 MAR 2026",
  subtitle: "Day 8 of War",
  operation: "Operation Epic Fury",
  threatLevel: "CRITICAL",
  location: "Kuala Lumpur, MY",
  headline: "US-Israel war on Iran — Day 8 status — five-signal threat map",
  tickers: [
    { label: "Brent Crude", value: "$82.76", sub: "+36% YTD", tone: "alert" },
    { label: "Gold (spot)", value: "$5,400+", sub: "ATH breach", tone: "warn" },
    { label: "BTC/USD", value: "$70,559", sub: "Fear: 22", tone: "down" },
    { label: "Iran War", value: "DAY 8", sub: "1,332 dead", tone: "alert" },
  ],
  summary: [
    { rank: 1, title: "Iran War (Day 8)", severity: "CRITICAL", tags: ["WAR"], body: "US-Israel strikes continue; 1,332 dead. Khamenei assassinated. Strait of Hormuz closed. Regional spillover into Lebanon, Gulf states. Trump: 'No time limits.'" },
    { rank: 2, title: "Energy shock", severity: "HIGH", tags: ["ENERGY"], body: "Brent at $82.76, +36% YTD. Goldman: 4-week disruption priced in at $78. Sustained Hormuz closure = $100+. OPEC+ added only 206k b/d — insufficient buffer." },
    { rank: 3, title: "Global inflation", severity: "HIGH", tags: ["MACRO"], body: "Fed, ECB, BNM all holding rates. Morgan Stanley warns oil shock compounds tariff inflation. Fed cut cycle effectively paused. US CPI at 2.4% heading higher." },
    { rank: 4, title: "Crypto selloff", severity: "MEDIUM", tags: ["CRYPTO"], body: "BTC at ~$70,559. ETF outflows resumed ($227M Thu). Extreme Fear index: 22. Standard Chartered target cut to $50k. Correlation with S&P 500 at 0.55." },
    { rank: 5, title: "Geopolitical fragmentation", severity: "MEDIUM", tags: ["GEOPOLITICS"], body: "US dismantling rules-based order. China 'electrostate' challenge rising. Venezuela regime change precedent. ASEAN summit pressure from Iran war fallout." },
  ],
  geopolitics: [
    { id: "epic-fury-d8", title: "OPERATION EPIC FURY — DAY 8", status: "ESCALATING", severity: "CRITICAL", region: "Iran", ...GEO.tehran, body: "US struck ~2,000 targets in 7 days ($891M/day — CSIS). B-2 bombers dropped 'penetrator' bombs on buried missile silos. Iran launched 500 missiles + 2,000 drones across 9 countries. Khamenei dead — succession battle: Mojtaba Khamenei emerging." },
    { id: "hormuz-d8", title: "STRAIT OF HORMUZ — CLOSED", status: "CLOSED", severity: "CRITICAL", region: "Persian Gulf", ...GEO.hormuz, body: "20% of global oil at risk. Qatar LNG plants halted — Europe gas spiked to €18/MWh. US sub sank Iranian frigate IRIS Dena near Sri Lanka." },
    { id: "bahrain-5th", title: "BAHRAIN — 5TH FLEET HQ HIT", status: "ACTIVE", severity: "HIGH", region: "Bahrain", ...GEO.bahrain, body: "Bahrain 5th Fleet HQ hit multiple times. Lebanon: 123 dead after Hezbollah-Israel exchange resumes." },
    { id: "russia-intel", title: "RUSSIA SUPPLYING IRAN INTEL", status: "WATCH", severity: "HIGH", region: "Russia", ...GEO.moscow, body: "Russia supplying Iran with intel on US warship locations. Shifts military calculus significantly — US naval operations now face elevated targeting risk across the Indo-Pacific." },
  ],
  markets: [
    { asset: "Brent Crude", price: "$82.76", change: "+36% YTD", tone: "alert", signal: "CRITICAL — near 14-month high. Hormuz closure risk.", keyLevel: "$90-120" },
    { asset: "WTI Crude", price: "$71.23", change: "+32% YTD", tone: "alert", signal: "Goldman fair value $65 without conflict. $18/bbl war premium.", keyLevel: "$65 fair" },
    { asset: "Gold (XAU)", price: "$5,400+", change: "ATH breach", tone: "warn", signal: "JPMorgan target $6,300 by Dec 2026. Structural safe-haven.", keyLevel: "$6,300" },
    { asset: "BTC/USD", price: "$70,559", change: "-44% fr ATH", tone: "down", signal: "ETF outflows $227M Thu. StanChart cuts target to $50k.", keyLevel: "Fear: 22" },
    { asset: "S&P 500", price: "~6,850", change: "Mixed", tone: "flat", signal: "Wells Fargo base 7,500 YE; worst-case 6,000. Defense +3-6%.", keyLevel: "6,000-7,500" },
    { asset: "USD Index", price: "+0.95%", change: "5-wk high", tone: "up", signal: "Dollar strengthening on safe-haven. EM currencies under pressure." },
    { asset: "EUR Gas", price: "€18/MWh", change: "Near-doubled", tone: "alert", signal: "Qatar LNG plants halted; European energy security under threat." },
  ],
  centralBanks: [
    { name: "Federal Reserve", stance: "HOLD", rate: "4.25-4.50%", tone: "alert", note: "CPI 2.4% + oil shock + tariffs = cuts paused. Yellen: war 'puts Fed even more on hold.'" },
    { name: "ECB", stance: "HOLD/WATCH", rate: "~2.50%", tone: "warn", note: "'Genuine dilemma' — oil shock risks pushing already-sticky inflation higher vs weakening growth." },
    { name: "Bank Negara (MY)", stance: "HOLD", rate: "2.75%", tone: "alert", note: "All 24 Bloomberg economists expect hold. War uncertainty decisive." },
    { name: "State Bank (PK)", stance: "HOLD", rate: "10.5%", tone: "alert", note: "96% of market survey expects hold on Mar 9. Oil shock + geopolitics override rate-cut appetite." },
    { name: "Nomura / Asia", stance: "FISCAL FIRST", rate: "Varies", tone: "flat", note: "'Use fiscal as first line of defense.' Price controls, subsidies, tariff cuts favored over rate moves." },
  ],
  regional: [
    {
      country: "Pakistan",
      flag: "🇵🇰",
      tag: "WATCH",
      metrics: [
        { label: "SBP Rate", value: "10.5%", sub: "HOLD Mar 9", tone: "warn" },
        { label: "KSE-100", value: "-2.3% Fri", sub: "VOLATILE", tone: "down" },
        { label: "Remittances", value: "$38.3B", sub: "+26.6% YoY", tone: "up" },
        { label: "GDP", value: "3.5%", sub: "UN forecast", tone: "flat" },
      ],
      analysis: [
        "SBP meets Mar 9 — 96% expect HOLD at 10.5%. Oil shock from Iran war seals the decision.",
        "KSE-100 fell 2.3% Friday and recorded a 16,089-point single-day crash on Mar 2 — among the largest in history. Blue-chip buying helped partial recovery.",
        "Pakistan is an oil IMPORTER — sustained Brent above $80 erodes fiscal gains achieved under IMF programme.",
        "Digital payments momentum: JazzCash processed PKR 15 trillion (~13% of GDP) in 2025. UAE debt-equity swap: Fauji shares accepted in lieu of $1B deposit.",
      ],
    },
    {
      country: "Malaysia",
      flag: "🇲🇾",
      tag: "NET EXPORTER",
      metrics: [
        { label: "BNM Rate", value: "2.75%", sub: "HOLD", tone: "warn" },
        { label: "GDP 2026", value: "4.7%", sub: "RHB maintain", tone: "up" },
        { label: "Petronas", value: "2M BOE/day", sub: "net exporter", tone: "up" },
        { label: "Fiscal Target", value: "-3.5% GDP", sub: "maintained", tone: "flat" },
      ],
      analysis: [
        "Rising Brent is a short-term fiscal positive via higher Petronas dividends and upstream revenue.",
        "BNM holds at 2.75% — all 24 Bloomberg economists surveyed expect no change.",
        "RHB and Hong Leong maintain 4.7% GDP growth for 2026. Fiscal deficit target of -3.5% expected to hold as oil revenue offsets subsidy costs.",
        "Aviation sector under pressure: AirAsia, Malaysia Airlines routes to Middle East disrupted. War-risk insurance premiums surging.",
      ],
    },
  ],
  weakSignals: [
    { title: "Russia intel leak", risk: "HIGH", body: "Russia confirmed providing Iran with real-time location data on US warships and aircraft. Shifts military calculus — US naval operations now face elevated targeting risk across the Indo-Pacific." },
    { title: "Mojtaba succession", risk: "HIGH", body: "Khamenei's son Mojtaba emerging as frontrunner. IRGC-aligned, hardliner profile. A Mojtaba-led Iran could be MORE belligerent — eliminating hopes of a negotiated off-ramp." },
    { title: "Kurdish ground offensive", risk: "MEDIUM", body: "Kurdish-Iranian armed groups launched ground operations in NW Iran. Iraqi Kurds on 'standby' at US request. Opens a multi-front scenario that could ignite Turkey." },
    { title: "Silver structural shift", risk: "MEDIUM", body: "Geopolitical monitor flags silver moving from periphery to center of critical mineral geopolitics. Iran-conflict gold-silver flows + industrial demand = potential structural repricing event." },
    { title: "AI bubble risk", risk: "MEDIUM", body: "OpenAI won't profit until 2030; Anthropic break-even 2028. $400B+ annual data center spend financed by debt. War compounds investor risk-off — AI capex bubble could pop if macro deteriorates." },
    { title: "Hormuz shipping stall", risk: "CRITICAL", body: "Tanker traffic effectively stalled — war-risk insurance premiums surged. Wood Mackenzie: nearest analogue is 1970s oil embargo (prices 300%). If sustained, $100/bbl Brent is a floor, not ceiling." },
  ],
  opportunities: [
    { asset: "Gold (XAU/USD)", action: "BUY", horizon: "STRUCTURAL", confidence: "HIGH", body: "JPMorgan $6,300 target Dec 2026. Sustained Hormuz disruption = persistent safe-haven + inflation hedge bid. Structural case intact." },
    { asset: "Oil (short-term)", action: "BUY", horizon: "SHORT", confidence: "HIGH", body: "Goldman: $65 fair value pre-war; $82+ now. If Hormuz remains closed, $100+ likely. Trade with tight stops — conflict resolution = sharp reversal." },
    { asset: "Defense stocks (US)", action: "BUY", horizon: "MULTI-YEAR", confidence: "HIGH", body: "Northrop +6%, RTX +4.7%, Lockheed +3.4% on Day 1. Multi-year government spending cycle now underway. Oxford Economics: sell extreme moves, buy dips." },
    { asset: "BTC (accumulate dip)", action: "WATCH", horizon: "MEDIUM", confidence: "MEDIUM", body: "Abu Dhabi sovereign wealth (Mubadala) buying ETF dips. Fear: 22 = historically strong entry signal. DCA strategy — not lump sum. Bottom may be March-April." },
    { asset: "Petronas / KLCI (MY)", action: "WATCH", horizon: "MEDIUM", confidence: "MEDIUM", body: "Malaysia net oil exporter — Petronas revenue boost feeds fiscal buffer. Watch BNM for any policy shift signal if inflation surprises." },
    { asset: "Airlines / Aviation", action: "AVOID", horizon: "SHORT", confidence: "HIGH", body: "United -4.2%, Air France -9.4%, Lufthansa -5.2%. Dubai air hub effectively closed. Middle East route suspensions extending." },
  ],
  predictions: [
    { horizon: "30D", event: "Brent above $80", prediction: "Brent crude stays above $80/bbl for 30 days.", confidence: "HIGH", status: "BULLISH" },
    { horizon: "4 WEEKS", event: "Hormuz reopens", prediction: "Strait of Hormuz reopens within 4 weeks.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "BY APR 7", event: "Iran ceasefire", prediction: "Iran ceasefire / diplomatic off-ramp by Apr 7.", confidence: "LOW", status: "BEARISH" },
    { horizon: "MAR", event: "Gold $5,600", prediction: "Gold hits $5,600 before end of March.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "2 WEEKS", event: "BTC below $65K", prediction: "BTC breaks below $65,000 in next 2 weeks.", confidence: "MEDIUM", status: "BEARISH" },
    { horizon: "MAR 9", event: "SBP holds", prediction: "Pakistan SBP holds rate on Mar 9.", confidence: "HIGH", status: "PRIMED" },
    { horizon: "SUCCESSION", event: "Mojtaba leader", prediction: "Mojtaba Khamenei becomes Supreme Leader.", confidence: "MEDIUM", status: "ACTIVE" },
    { horizon: "SCENARIO", event: "Global recession", prediction: "Global recession scenario (oil > $100 sustained).", confidence: "LOW", status: "WATCH" },
  ],
  analystNote:
    "Five-signal threat map for the week: the war is the dominant variable, but the second-order shocks — Qatar LNG halt feeding European gas, Russia feeding Iran US warship coordinates, and Korean capital rotating into BTC — are where the asymmetric moves live. Gold remains the cleanest expression of the regime.",
  sources: ["Al Jazeera", "CNN", "Wikipedia", "Gulf News", "CoinDesk", "ADB", "Dawn", "IMF"],
};

// ── 02 APRIL 2026 · EDITION 016 · DAY 34 · POST-SPEECH RECKONING ────────────
const ed_0402: Edition = {
  id: "2026-04-02",
  editionNo: "016",
  date: "2026-04-02",
  dateLabel: "02 APR 2026",
  subtitle: "Day 34 · Post-Speech Reckoning",
  operation: "Operation Epic Fury — Week 5",
  threatLevel: "HIGH",
  location: "Kuala Lumpur, MY",
  headline:
    "Trump speech verdict: 'nearing completion' + 'hit extremely hard 2-3 more weeks' — zero exit clarity — oil +5% to $112",
  tickers: [
    { label: "Brent", value: "$111.69", sub: "+$41 from pre-war", tone: "alert" },
    { label: "Gold", value: "$4,703", sub: "▼ from $4,800 high", tone: "down" },
    { label: "BTC", value: "$66,609", sub: "$65K floor holds", tone: "down" },
    { label: "SOL", value: "~$82", sub: "-5.2% · watch $78", tone: "down" },
    { label: "HYPE", value: "~$38", sub: "+47.9% YTD", tone: "up" },
  ],
  summary: [
    { rank: 1, title: "Trump speech verdict: not a TACO — war continues 2-3 more weeks with escalation", severity: "CRITICAL", tags: ["WAR", "SPEECH"], body: "19 minutes. Cross Hall of the White House. Not a victory declaration, not an exit. Four familiar points: war necessary, already won, will wrap up soon, will 'hit them extremely hard over the next two to three weeks.' Oil spiked 5% past $107. BTC fell 2.2% to $66,609. S&P 500 posted its worst quarterly performance since September 2022." },
    { rank: 2, title: "Kharazi strike — the Pakistan back-channel mediator was targeted", severity: "CRITICAL", tags: ["DIPLOMACY"], body: "Kamal Kharazi — former Iranian FM overseeing engagement with Pakistan — was seriously wounded and his WIFE killed in a strike. He was overseeing engagement with Pakistan for a possible Iranian officials–US VP JD Vance meeting. Iran's FM Araghchi: trust is 'at zero.' This single event may have done more damage to diplomacy than 33 days of bombing." },
    { rank: 3, title: "Iran-Oman Hormuz 'monitoring protocol' — stocks briefly recovered", severity: "HIGH", tags: ["HORMUZ"], body: "Iranian state media reported Iran and Oman are drafting a protocol to 'monitor' ships passing through Hormuz. First concrete Hormuz mechanism signal in 34 days. 'Monitoring' is far from 'opening' — but it is the first physical step toward reopening, even before a ceasefire." },
    { rank: 4, title: "Oil $111.69 — speech added $7/barrel overnight", severity: "HIGH", tags: ["ENERGY"], body: "Brent reached $111.69 by 10:15am ET — $41.42 above the pre-war price. Oxford Economics: 'a sustained geopolitical risk premium is now embedded in oil prices.' OPEC+ meets April 5 — the first major production policy decision since the war began." },
    { rank: 5, title: "Wang Yi calls US strikes 'violation of international law' — NATO fractures deepen", severity: "MEDIUM", tags: ["GEOPOLITICS", "NATO"], body: "Chinese FM Wang Yi said US-Israeli attacks on Iran are 'a violation of international law.' Spain and Italy have blocked airspace for US war planes. Trump told the Telegraph he's 'considering pulling all of NATO.' Geopolitical fragmentation of the post-war order is accelerating." },
  ],
  geopolitics: [
    { id: "speech-d34", title: "TRUMP SPEECH — DAY 34 RECKONING", status: "ESCALATING", severity: "CRITICAL", region: "Washington", ...GEO.washington, body: "'Nearing completion' + 'hit them extremely hard over the next 2-3 weeks.' Markets read it as no exit. Oil +5%, BTC -2.2%, S&P worst quarter since Sept 2022. The 4th major 'TACO' pattern event — markets now fully internalised that the war won't end quickly." },
    { id: "kharazi", title: "KHARAZI STRIKE — BACK-CHANNEL TARGETED", status: "CRITICAL", severity: "CRITICAL", region: "Iran", ...GEO.tehran, body: "Kamal Kharazi (Pakistan back-channel mediator) seriously wounded; wife killed. The US struck the diplomat running the peace track. Iran FM Araghchi: trust 'at zero.' Deal probability revised DOWN to 40% from 80%." },
    { id: "iran-oman", title: "IRAN-OMAN HORMUZ MONITORING PROTOCOL", status: "DE-ESCALATION", severity: "MEDIUM", region: "Oman", ...GEO.oman, body: "First concrete Hormuz mechanism in 34 days. Oman is the only Gulf state with normal diplomatic relations with Tehran — used in past US-Iran nuclear talks. If formalised, Brent drops to $85-95. If collapses: back to $115+. Watch Oman FM communications." },
    { id: "opec-apr5", title: "OPEC+ MEETING APR 5", status: "WATCH", severity: "HIGH", region: "Vienna / Gulf", ...GEO.qatar, body: "First major OPEC production decision since the war. Saudi in a bind: benefit from $111 oil fiscally but face US pressure to increase supply. Goldman: Brent avg $110 through April if war premium holds. JPMorgan: below $80 by Q3 if Hormuz reopens." },
    { id: "nato-fracture", title: "NATO FRACTURE — WANG YI / SPAIN / ITALY", status: "ESCALATING", severity: "MEDIUM", region: "Europe", ...GEO.madrid, body: "Wang Yi: US strikes 'violation of international law.' Spain + Italy blocked airspace for US war planes. Trump 'considering pulling all of NATO.' NATO SecGen Rutte to visit White House — likely emergency damage control." },
  ],
  markets: [
    { asset: "Brent Crude", price: "$111.69", change: "+$6.83 day", tone: "alert", signal: "Speech added $7/bbl. OPEC+ Apr 5 = next catalyst. Floor $100 confirmed.", keyLevel: "$100 floor" },
    { asset: "Gold (XAU)", price: "$4,703", change: "▼ -$100 fr $4,800", tone: "down", signal: "0.70 beta to S&P confirmed. $4,267 stop unchanged. Add sub-$4,500 on dips.", keyLevel: "$4,267 stop" },
    { asset: "Silver (XAG)", price: "~$71", change: "-6% post-speech", tone: "down", signal: "War supply floor intact. $60 confirmed bottom. Dip = add zone.", keyLevel: "$60 floor" },
    { asset: "Bitcoin (BTC)", price: "$66,609", change: "-2.2%", tone: "down", signal: "$422M liquidations. IBIT -$86M outflows. Floor $65K institutional. Morgan Stanley ETF this week.", keyLevel: "$65K floor" },
    { asset: "SOL", price: "~$82", change: "-5.2% (worst major)", tone: "down", signal: "Week decline 13%. Alpenglow H1 unchanged. $78 stop watch carefully.", keyLevel: "$78 stop" },
    { asset: "HYPE", price: "~$37-38", change: "▼ slight", tone: "down", signal: "Oil vol persists. War fees intact. Hold. Least war-correlated asset in portfolio.", keyLevel: "+47.9% YTD" },
    { asset: "S&P 500", price: "Worst Q since 2022", change: "▼ post-speech", tone: "down", signal: "Iran-Oman Hormuz protocol = brief recovery. Speech damage ongoing.", keyLevel: "−1.5% to +0.4%" },
    { asset: "10-Yr Treasury", price: "~4.32%", change: "→ elevated", tone: "warn", signal: "Stagflation pricing. 45% rate hike probability. Fed cannot cut until oil normalises.", keyLevel: "Hike: 45%" },
  ],
  centralBanks: [
    { name: "Federal Reserve", stance: "HAWKISH", rate: "4.25-4.50%", tone: "alert", note: "45% rate HIKE probability with oil at $111 + stagflation. FOMC Apr 28-29 first major decision. Fed cannot cut until oil normalises." },
    { name: "OPEC+", stance: "DECISION APR 5", rate: "206k b/d", tone: "warn", note: "First major production decision of the war. Saudi breakeven ~$80; $111 price benefits cartel fiscally vs US supply pressure." },
  ],
  regional: [
    {
      country: "Pakistan",
      flag: "🇵🇰",
      tag: "BACK-CHANNEL STRUCK",
      metrics: [
        { label: "Mediation", value: "TARGETED", sub: "Kharazi struck", tone: "alert" },
        { label: "Role", value: "REGIONAL BROKER", sub: "moment in the sun", tone: "warn" },
        { label: "Deal Prob", value: "40%", sub: "▼ from 80%", tone: "down" },
        { label: "Sovereign", value: "UNDERVALUED", sub: "EM credit", tone: "up" },
      ],
      analysis: [
        "Kharazi was overseeing the Pakistan back-channel — its targeting strikes at Pakistan's mediation role directly.",
        "Pakistan's 'moment in the sun' framing is now mainstream; success elevates regional standing, failure exposes it to a war it is trying to avoid.",
        "Pre-consensus trade: PAK USD 2027/2031 sovereign is the most undervalued geopolitical option in EM credit if Islamabad delivers a US-Iran framework.",
        "Narrative shifts from 'IMF dependent' to 'regional broker' on any mediation headline.",
      ],
    },
    {
      country: "Malaysia",
      flag: "🇲🇾",
      tag: "DATA CENTRE PIVOT",
      metrics: [
        { label: "KLCI", value: "1,729.60", sub: "+0.72% Tue", tone: "up" },
        { label: "USD/MYR", value: "3.9528", sub: "12M +0.66%", tone: "flat" },
        { label: "CPO Jul26", value: "RM 4,500+", sub: "biodiesel bid", tone: "up" },
        { label: "BNM Rate", value: "HOLD", sub: "growth-support", tone: "warn" },
      ],
      analysis: [
        "Ringgit holding 3.95 with structural tailwinds: net energy exporter status, AI supply-chain positioning, data-center capex inflows.",
        "MY data centre + nuclear pivot = Tier 3 pre-consensus position with institutional tailwind confirmed by Bain, WEC, and now Malaysia government.",
        "Loomis Sayles and Deutsche Bank both target 3.85-3.90 retest. KLCI 12M consensus 1,821 — implies +5.3% upside.",
        "Watch CPO: weak ringgit + biodiesel economics + El Niño risk = floor at RM 4,500.",
      ],
    },
  ],
  weakSignals: [
    { title: "Gallium proxies", risk: "HIGH", body: "China controls 99% of global gallium production. As Hormuz drags on, Beijing has zero incentive to relax critical mineral exports. Indium Corp and Western refiners benefit asymmetrically from any Chinese export squeeze." },
    { title: "Pakistan crypto perimeter", risk: "MEDIUM", body: "SBP draws formal regulatory line on virtual asset services to Pakistani users — first explicit signal. Likely trajectory: licensed-only intermediaries with banking-layer audit trails. Implications for Roshan Digital expansion." },
    { title: "Falcon quantum signatures", risk: "MEDIUM", body: "Anza and Firedancer have independently completed initial Falcon (post-quantum) implementations on Solana. First major L1 with credible quantum-resistance shipping. Optionality, not priced in." },
    { title: "UAE OPEC exit", risk: "MEDIUM", body: "UAE departure from OPEC read as tactical; strategic read is Gulf coordination architecture is fragmenting. If Saudi-Emirati alignment frays during a war, US security guarantees become harder to underwrite." },
    { title: "Uranium / AI-nuclear flywheel", risk: "HIGH", body: "The hyperscaler-nuclear PPA flywheel is accelerating quietly. Oil at $100 + LNG security thesis broken by Hormuz = uranium is the only geopolitically clean baseload. Spot lagged equities — convergence trade." },
  ],
  opportunities: [
    { asset: "Gold + Silver (buy the dip)", action: "BUY", horizon: "ADD ZONE $4,800-4,703", confidence: "HIGH", body: "$100+ crash after 'nearing completion' was safe-haven unwinding, not a structural change. Every dip below $4,500 is the add zone. Stop $4,267. Target $5,000-5,400 by YE. Silver: $60 floor; add $66-69 on dips." },
    { asset: "BTC + SOL (hold)", action: "HOLD", horizon: "DO NOT CHASE DOWN", confidence: "MEDIUM", body: "BTC $66,609 within the $65K-$73K war range held for 34 days. Morgan Stanley ETF (14bps, 16,000 advisors, $6.2T AUM) is the Q2 catalyst independent of the war. SOL $78 stop. Hold HYPE — oil volatility is structural." },
    { asset: "Gallium proxies", action: "BUY", horizon: "ENTRY NOW", confidence: "HIGH", body: "China controls 99% of gallium. Indium Corp (INDIUM) / 5N Plus benefit from any Chinese export squeeze. Catalyst: China export controls." },
    { asset: "Pakistan sovereign", action: "BUY", horizon: "ON MEDIATION HEADLINE", confidence: "MED-HIGH", body: "PAK USD 2027/2031. Most undervalued geopolitical option in EM credit. If Islamabad delivers a US-Iran framework, sovereign spreads compress. Catalyst: peace deal + IMF." },
    { asset: "Uranium spot", action: "BUY", horizon: "ON ANY DIP", confidence: "HIGH", body: "CCJ / NXE / Sprott U.UN. Hyperscaler-nuclear PPA flywheel accelerating. Only geopolitically clean baseload. Spot has lagged equities — convergence trade." },
    { asset: "MY Data Center REIT", action: "WATCH", horizon: "PHASED 1.5%/WK", confidence: "MEDIUM", body: "AME REIT / KIP REIT. Singapore data center moratorium persists; Johor + Cyberjaya are structural beneficiaries. 6-9 month lag between hyperscaler commitments and rental income. Buy the lag." },
  ],
  predictions: [
    { horizon: "APR 3", event: "March NFP", prediction: "Markets CLOSE after print (Good Friday). Weak NFP ~40-80K = stagflation confirmed.", confidence: "HIGH", status: "PRIMED" },
    { horizon: "APR 5", event: "OPEC+ meeting", prediction: "Saudi will likely NOT significantly increase production — $111 benefits the cartel. Minimal 200-400K b/d.", confidence: "HIGH", status: "ACTIVE" },
    { horizon: "APR 6", event: "Energy deadline", prediction: "Apr 6 deadline for striking Iranian energy. TACO pattern (4 so far) → another extension possible (45%).", confidence: "HIGH", status: "WATCH" },
    { horizon: "APR 7-10", event: "Iran / Kharazi", prediction: "Iran responds to diplomat strike by hardening. Watch for formal withdrawal from Pakistan back-channel.", confidence: "HIGH", status: "BEARISH" },
    { horizon: "APR 28-29", event: "FOMC", prediction: "First major Fed decision since the war. Hold most likely (55%); hike 15%; cut near zero. Stagflation = hike risk real.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "1 MO", event: "Hormuz", prediction: "Iran-Oman monitoring protocol is the first physical opening mechanism. If formalised, Brent drops to $85-95.", confidence: "HIGH", status: "WATCH" },
    { horizon: "YE 2026", event: "Gold", prediction: "$5,000-$6,300. War permanently reset hard asset floors. The $4,267 floor is structural, not situational.", confidence: "HIGH", status: "BULLISH" },
    { horizon: "YE 2026", event: "BTC", prediction: "$120K-$150K. Morgan Stanley ETF + Bernstein elongated bull cycle. Post-war relief rally = most bullish BTC catalyst of 2026.", confidence: "MEDIUM", status: "WATCH" },
  ],
  analystNote:
    "The speech changed everything — and nothing. Nothing: the war continues; oil at $112, BTC at $66.6K; the structural positions (gold, silver, HYPE, Rheinmetall, CCJ) are unchanged. Everything: the Kharazi strike may have been the most strategically damaging US action since Day 1 — killing the wife and wounding the diplomat managing the Pakistan back-channel while delivering a speech claiming 'nearing completion' sent a contradictory message to Tehran: we are close to a deal, but we will keep killing your diplomats. The Iran-Oman Hormuz protocol is the offsetting hope. The war is in its most dangerous phase: 'nearing completion' while ordering the hardest strikes — a compressed, final-phase escalation.",
  sources: ["CNN", "CNBC", "NPR", "Al Jazeera", "TIME", "WaPo", "Fortune", "Khaleej Times", "Gulf News", "Wikipedia", "CoinDesk", "TradingKey", "Oxford Economics"],
};

// ── 29 APRIL 2026 · EDITION 022 · WEEK 9 ────────────────────────────────────
const ed_0429: Edition = {
  id: "2026-04-29",
  editionNo: "022",
  date: "2026-04-29",
  dateLabel: "29 APR 2026",
  subtitle: "US-Iran War // Week 9",
  operation: "US Naval Blockade of Hormuz",
  threatLevel: "HIGH",
  location: "Kuala Lumpur, MY",
  headline:
    "Iran war enters week 9 — US naval blockade of Hormuz in effect — WTI breaks $100 — FOMC tonight",
  tickers: [
    { label: "WTI Crude", value: "$100.18", sub: "+3.9% 24H", tone: "alert" },
    { label: "BTC", value: "$76,923", sub: "-2.4% 24H", tone: "down" },
    { label: "SOL", value: "$84.12", sub: "-2.8% 24H", tone: "down" },
    { label: "USD/MYR", value: "3.9528", sub: "+0.01% 24H", tone: "flat" },
  ],
  summary: [
    { rank: 1, title: "Iran war Week 9 — US naval blockade of Hormuz still in effect", severity: "CRITICAL", tags: ["WAR", "HORMUZ"], body: "Tehran's latest peace proposal, relayed through Pakistani mediation, was reportedly rejected by Trump over the nuclear program clause. WTI broke $100 for the first time since the early-April peak, extending a seven-day rally. The IEA has formally warned of an unprecedented supply shock. UAE has unexpectedly withdrawn from OPEC, but the move delivers only limited relief — Hormuz remains the binding constraint." },
    { rank: 2, title: "Crypto sold off in lockstep with risk assets", severity: "HIGH", tags: ["CRYPTO"], body: "BTC rejected $79.4K and slid below $77K; SOL holding $83 support. Markets positioned for a FOMC hold. Setup favors continued energy bid, gold strength, and defensive crypto." },
    { rank: 3, title: "Pakistan central bank raised rates — first hike in nearly three years", severity: "HIGH", tags: ["PAKISTAN", "RATES"], body: "SBP raised the policy rate this week — first hike in nearly three years — explicitly citing imported inflation from the Hormuz disruption. First explicit crypto perimeter signal to Pakistani users." },
    { rank: 4, title: "Malaysia KLCI +0.72% — ringgit 3.9528 ahead of FOMC", severity: "MEDIUM", tags: ["MALAYSIA"], body: "KLCI closed +0.72% at 1,729.60. Ringgit holding 3.95 with structural tailwinds intact: net energy exporter status, AI supply-chain positioning, data-center capex inflows." },
  ],
  geopolitics: [
    { id: "us-iran-w9", title: "US-IRAN WAR // WEEK 9", status: "ESCALATING", severity: "CRITICAL", region: "Iran", ...GEO.tehran, body: "Day 60. Hormuz traffic ~5%. Blockade ACTIVE since April 13. Direct US-Iran negotiations in Islamabad collapsed April 12. Iran conveyed via Pakistan that hostilities would cease if Washington lifts the blockade, agrees to a revised Hormuz transit framework, and provides assurances against future strikes. Trump rejected — nuclear program is the sticking point." },
    { id: "hormuz-blockade", title: "STRAIT OF HORMUZ — US NAVAL BLOCKADE", status: "BLOCKADE ACTIVE", severity: "CRITICAL", region: "Persian Gulf", ...GEO.hormuz, body: "Hormuz traffic ~5%. Blockade initiated April 13. Per CSIS, the Gulf has shifted into a category where commercial exposure cannot be cleanly separated from conflict risk. Tanker insurance and war-risk surcharges remain near record highs." },
    { id: "pak-mediation", title: "PAKISTAN MEDIATION — HIGH STAKES", status: "MEDIATOR", severity: "HIGH", region: "Pakistan", ...GEO.islamabad, body: "Islamabad's mediation role is high-stakes: success elevates Pakistan's regional standing meaningfully; failure exposes it to a war it is trying to avoid. President Zardari hosting MoU signings. Pakistan's 'moment in the sun' framing is now mainstream." },
    { id: "china-russia-pos", title: "CHINA-RUSSIA POSITIONING", status: "WATCH", severity: "MEDIUM", region: "China / Russia", ...GEO.beijing, body: "Per Foreign Affairs, Beijing and Moscow are exploiting the Iran war by letting the US absorb the cost in missile inventory and political capital. CSIS warns munitions are being depleted — the real risk is the next war, against a peer like China." },
  ],
  markets: [
    { asset: "WTI Crude", price: "$100.18", change: "+3.9% 24H", tone: "alert", signal: "Broke $100 psychological. Range $86-$102. IEA warns unprecedented supply shock.", keyLevel: "$100 psych" },
    { asset: "Brent", price: "$104.20", change: "+3.7%", tone: "alert", signal: "Hormuz blockade premium sustained.", keyLevel: "$100+" },
    { asset: "Gold", price: "$3,412", change: "+0.8%", tone: "up", signal: "Structural safe-haven bid persists.", keyLevel: "" },
    { asset: "Silver", price: "$42.18", change: "+1.2%", tone: "up", signal: "Industrial + safe-haven dual demand.", keyLevel: "" },
    { asset: "BTC", price: "$76,923", change: "-2.4% 24H", tone: "down", signal: "Rejected $79.4K. Key support $74K. Watch $72K for flush.", keyLevel: "$74K support" },
    { asset: "SOL", price: "$84.12", change: "-2.8% 24H", tone: "down", signal: "Stop $78. Target $97. 29/30 indicators bearish.", keyLevel: "$78 stop" },
    { asset: "ETH", price: "$2,840", change: "-3.1%", tone: "down", signal: "BTC correlated. No idiosyncratic catalyst until June.", keyLevel: "" },
    { asset: "UST 10Y", price: "4.42%", change: "+3 BP", tone: "warn", signal: "Stagflation pricing intact ahead of FOMC.", keyLevel: "" },
    { asset: "DXY", price: "104.18", change: "-0.2%", tone: "flat", signal: "Range-bound ahead of Fed.", keyLevel: "" },
  ],
  centralBanks: [
    { name: "Federal Reserve", stance: "HOLD (FOMC tonight)", rate: "4.25-4.50%", tone: "alert", note: "FOMC tonight 0700 MYT. Dovish dot-plot shift is the unwind catalyst. Markets positioned for hold." },
    { name: "State Bank (PK)", stance: "RAISED", rate: "first hike 3yr", tone: "alert", note: "First hike in nearly three years — explicitly citing imported inflation from the Hormuz disruption." },
    { name: "Bank Negara (MY)", stance: "HOLD", rate: "growth-support", tone: "warn", note: "Ringgit holding 3.95 with structural tailwinds intact. Foreign positioning at multi-year lows = unwind catalyst is tonight's FOMC." },
  ],
  regional: [
    {
      country: "Pakistan",
      flag: "🇵🇰",
      tag: "DESK",
      metrics: [
        { label: "SBP Rate", value: "RAISED", sub: "first hike 3yr", tone: "alert" },
        { label: "FY26 GDP", value: "3.5%", sub: "ADB forecast", tone: "flat" },
        { label: "Inflation", value: "6.4%", sub: "above target", tone: "warn" },
        { label: "Ext Debt", value: "$138B", sub: "33.4% GDP", tone: "down" },
      ],
      analysis: [
        "SBP raised the policy rate — first hike in nearly three years — explicitly citing imported inflation from the Hormuz disruption.",
        "Oil companies association has formally requested SBP relief on Gulf-bound shipments due to elevated freight rates and war-risk premiums.",
        "Power sector exposure is severe: ~6,000MW of RLNG capacity is running at ~500MW peak with debt service and capacity payments continuing.",
        "SBP draws formal regulatory line on virtual asset services to Pakistani users — first explicit crypto perimeter signal.",
      ],
    },
    {
      country: "Malaysia",
      flag: "🇲🇾",
      tag: "EYES ON POWELL",
      metrics: [
        { label: "KLCI", value: "1,729.60", sub: "+0.72% Tue", tone: "up" },
        { label: "USD/MYR", value: "3.9528", sub: "12M +0.66%", tone: "flat" },
        { label: "CPO Jul26", value: "RM 4,500+", sub: "biodiesel bid", tone: "up" },
        { label: "BNM Rate", value: "HOLD", sub: "growth-support", tone: "warn" },
      ],
      analysis: [
        "Ringgit holding 3.95 with structural tailwinds intact: net energy exporter status, AI supply-chain, data-center capex inflows.",
        "Loomis Sayles and Deutsche Bank both target 3.85-3.90 retest. KLCI 12M consensus 1,821 — implies +5.3% upside, driven by Tenaga, CIMB, Gamuda, Public Bank earnings.",
        "Foreign positioning at multi-year lows — unwind catalyst is tonight's FOMC dovish surprise.",
        "Watch CPO: weak ringgit + biodiesel economics + El Niño risk = floor at RM 4,500.",
      ],
    },
  ],
  weakSignals: [
    { title: "UAE OPEC exit", risk: "MEDIUM", body: "UAE departure from OPEC is being read as tactical; the strategic read is the Gulf coordination architecture is fragmenting. If Saudi-Emirati alignment frays during a war, US security guarantees become harder to underwrite." },
    { title: "Pakistan crypto perimeter", risk: "MEDIUM", body: "SBP draws formal regulatory line on virtual asset services to Pakistani users — first explicit signal. Likely trajectory: licensed-only intermediaries with banking-layer audit trails. Implications for Roshan Digital." },
    { title: "Falcon quantum signatures", risk: "MEDIUM", body: "Anza and Firedancer have independently completed initial Falcon (post-quantum) implementations on Solana. First major L1 with credible quantum-resistance shipping. Optionality, not priced in." },
  ],
  opportunities: [
    { asset: "Gallium proxies (Indium Corp / 5N Plus)", action: "BUY", horizon: "ENTRY NOW", confidence: "HIGH", body: "China controls 99% of global gallium. The semiconductor supply chain has not priced the second-order risk: as Hormuz drags on, Beijing has zero incentive to relax critical mineral exports. Catalyst: China export controls." },
    { asset: "Pakistan sovereign (PAK USD 2027/2031)", action: "BUY", horizon: "ON MEDIATION HEADLINE", confidence: "MED-HIGH", body: "Most undervalued geopolitical option in EM credit. If Islamabad delivers a US-Iran framework, sovereign spreads compress as Pakistan unlocks Gulf capital. Narrative shifts from 'IMF dependent' to 'regional broker.' Catalyst: peace deal + IMF." },
    { asset: "Uranium spot (CCJ / NXE / Sprott)", action: "BUY", horizon: "ON ANY DIP", confidence: "HIGH", body: "The hyperscaler-nuclear PPA flywheel is accelerating quietly. Oil at $100, LNG security thesis broken by Hormuz — uranium is the only geopolitically clean baseload. Spot has lagged equities — convergence trade." },
    { asset: "MY Data Center REIT (AME / KIP)", action: "WATCH", horizon: "PHASED 1.5%/WK", confidence: "MEDIUM", body: "Singapore data center moratorium persists; Johor and Cyberjaya are structural beneficiaries. 6-9 month lag between hyperscaler commitments and rental income. Buying the lag. MYR strength compounds the trade." },
  ],
  predictions: [
    { horizon: "29 APR (TONIGHT)", event: "FOMC", prediction: "FOMC holds rates tonight, dovish dot-plot shift.", confidence: "HIGH", status: "PRIMED" },
    { horizon: "30 JUN", event: "Hormuz reopening", prediction: "Hormuz reopening framework before end of Q2.", confidence: "MEDIUM", status: "ACTIVE" },
    { horizon: "29 MAY", event: "WTI $110", prediction: "WTI tags $110 before $90 in next 30 days.", confidence: "MEDIUM", status: "BULLISH" },
    { horizon: "15 MAY", event: "BTC retest", prediction: "BTC retests $72K before reclaiming $80K.", confidence: "MEDIUM", status: "BEARISH" },
    { horizon: "06 MAY", event: "USD/MYR", prediction: "USD/MYR breaks 3.92 on dovish FOMC.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "30 JUN", event: "Pakistan IMF", prediction: "Pakistan IMF Q2 review delayed by war ripple.", confidence: "LOW", status: "WATCH" },
    { horizon: "30 JUN", event: "Uranium spot", prediction: "Uranium spot retakes $90/lb on AI-PPA news.", confidence: "HIGH", status: "BULLISH" },
  ],
  analystNote:
    "Week 9. The setup favors continued energy bid, gold strength, and defensive crypto. The binding constraint remains Hormuz — the UAE OPEC exit and any production tweak are noise against a naval blockade. Tonight's FOMC is the near-term unwind catalyst: a dovish dot-plot shift is the trigger that lets foreign positioning (multi-year lows) rebuild in KLCI and the ringgit.",
  sources: ["CNN", "CNBC", "NPR", "Al Jazeera", "Foreign Affairs", "CSIS", "IEA", "Oxford Economics", "Wikipedia", "CoinDesk", "TradingKey"],
};

// ── 05 MARCH 2026 · DAILY INTELLIGENCE BRIEF (early edition) ─────────────────
const ed_0305: Edition = {
  id: "2026-03-05",
  editionNo: "001",
  date: "2026-03-05",
  dateLabel: "05 MAR 2026",
  subtitle: "Strategic Situational Awareness",
  threatLevel: "ELEVATED",
  location: "Kuala Lumpur, MY",
  headline:
    "Iran crisis escalates — Strait of Hormuz declared closed — KOSPI crashes 12.1% — Gold $5,170",
  tickers: [
    { label: "S&P 500", value: "6,859", sub: "+0.8%", tone: "up" },
    { label: "Gold", value: "$5,159", sub: "+$35", tone: "up" },
    { label: "Brent", value: "$81.45", sub: "easing fr $85", tone: "down" },
    { label: "BTC", value: "$71,500", sub: "recovering", tone: "up" },
    { label: "KOSPI", value: "CRASH", sub: "-12.1%", tone: "alert" },
  ],
  summary: [
    { rank: 1, title: "Iran crisis escalates — Strait of Hormuz declared closed", severity: "CRITICAL", tags: ["ENERGY", "GEOPOLITICS"], confidence: "HIGH", body: "Following US-Israeli strikes that killed Iran's Supreme Leader Ayatollah Ali Khamenei, Iran declared the Strait of Hormuz closed. 20% of global oil transits Hormuz. Brent spiked to $85 before settling at ~$81. European gas up 50%. Trump ordered US naval escorts for tankers." },
    { rank: 2, title: "South Korea KOSPI crashes 12.1% — worst day in history", severity: "CRITICAL", tags: ["MARKETS", "ASIA"], confidence: "HIGH", body: "South Korean equities suffered their worst single-day drop ever — Middle East contagion, energy dependency, and semiconductor supply chain uncertainty. Signals extreme risk-off spreading from the Gulf into Asia-Pacific." },
    { rank: 3, title: "Pakistan declares 'open war' with Afghanistan", severity: "CRITICAL", tags: ["GEOPOLITICS", "PAKISTAN"], confidence: "HIGH", body: "Pakistan's military launched cross-border strikes against Afghan targets, accusing the Taliban of harboring separatist and terror groups. FM Asim Munir: peace depends on Kabul renouncing terrorism. Threatens CPEC logistics and border trade." },
    { rank: 4, title: "SCOTUS kills IEEPA tariff authority — trade regime reset", severity: "MEDIUM", tags: ["TRADE"], body: "SCOTUS determined IEEPA cannot be used for tariffs. All IEEPA-based tariffs terminated Feb 24. Trump pivoted to Section 122 (10-15%, 150-day expiry). US-China talks set for Paris; Trump visits Beijing March 31." },
    { rank: 5, title: "Gold hits $5,170/oz — safe-haven demand surges", severity: "HIGH", tags: ["MARKETS", "GOLD"], body: "Gold near all-time highs. Middle East escalation + inflation fears + tariff uncertainty driving massive safe-haven flows. Best-performing asset class of 2025-2026." },
  ],
  geopolitics: [
    { id: "iran-decap", title: "IRAN — REGIME DECAPITATION & HORMUZ", status: "CRITICAL", severity: "CRITICAL", region: "Iran", ...GEO.tehran, body: "US-Israeli strikes killed Supreme Leader Khamenei. Iran declared Strait of Hormuz closed. Global protests across Muslim-majority nations. Risk of full-scale regional war the highest since 2003." },
    { id: "hormuz-closed", title: "STRAIT OF HORMUZ — DECLARED CLOSED", status: "CLOSED", severity: "CRITICAL", region: "Persian Gulf", ...GEO.hormuz, body: "20% of global oil supply transits Hormuz. Energy prices spiking. Likely tactical posturing rather than a sustained blockade — Iran lacks naval capacity vs US carrier groups — but even the threat adds $3-5/bbl. Watch IRGC naval movements." },
    { id: "pak-afghan", title: "PAKISTAN-AFGHANISTAN — OPEN CONFLICT", status: "ESCALATING", severity: "CRITICAL", region: "South Asia", ...GEO.kabul, body: "Pakistan launched cross-border strikes into Afghanistan. FM Asim Munir declared peace conditional on Kabul ending support for terrorism. Destabilizes CPEC corridor; could trigger refugee flows. 23 killed in Khamenei demonstrations across Pakistan." },
    { id: "kospi-crash", title: "SOUTH KOREA — KOSPI CRASH 12.1%", status: "CRISIS", severity: "HIGH", region: "South Korea", ...GEO.seoul, body: "Worst day in KOSPI history. Energy dependency (99.5% import) and semiconductor concentration make Korea a canary for supply chain disruption. If chipmakers slow on energy costs, global AI hardware timelines slip." },
    { id: "us-china-paris", title: "US-CHINA — CAUTIOUS DIPLOMACY", status: "WATCH", severity: "MEDIUM", region: "China", ...GEO.beijing, body: "SCOTUS killed IEEPA tariff authority. New Section 122 tariff (10-15%, 150-day limit). Paris trade talks next week. Trump visiting Beijing March 31. First genuine window for trade de-escalation since 2018." },
  ],
  markets: [
    { asset: "S&P 500", price: "6,859", change: "+0.8%", tone: "up", signal: "Range-bound 6,700-7,000. Downside to 6,400 if oil > $90.", keyLevel: "6,700-7,000" },
    { asset: "NASDAQ", price: "22,763", change: "+1.1%", tone: "up", signal: "Tech holding despite macro headwinds." },
    { asset: "Brent Crude", price: "$81.45", change: "easing fr $85", tone: "down", signal: "If Hormuz reopens in 2 weeks, $72-76. If prolonged, $90-100+.", keyLevel: "$72-100" },
    { asset: "Gold", price: "$5,159", change: "+$35", tone: "up", signal: "Continues to $5,300-5,500 in Q2 on geopolitical uncertainty.", keyLevel: "$5,300-5,500" },
    { asset: "Bitcoin", price: "$71,500", change: "recovering", tone: "up", signal: "$79K resistance (break = bullish), $62.3K support. Bear flag.", keyLevel: "$62.3K-79K" },
    { asset: "KOSPI", price: "CRASH", change: "-12.1%", tone: "alert", signal: "Worst day in history. Energy + semiconductor exposure." },
    { asset: "USD", price: "STRONG", change: "safe haven", tone: "up", signal: "Remains strong through Q1. Weakens if Fed signals H2 cuts." },
  ],
  centralBanks: [
    { name: "Federal Reserve", stance: "HOLD (Mar 18)", rate: "—", tone: "warn", note: "Markets pricing a hold due to oil-driven inflation fears. Iran crisis pushed easing timeline back 2-3 months." },
    { name: "ECB", stance: "WATCH", rate: "—", tone: "flat", note: "Euro area inflation at 1.9% YoY. Oil shock complicates the easing cycle." },
    { name: "RBA", stance: "DELAY", rate: "—", tone: "flat", note: "May delay further tightening amid oil shock." },
  ],
  regional: [
    {
      country: "Pakistan",
      flag: "🇵🇰",
      tag: "HOME BASE",
      metrics: [
        { label: "Security", value: "OPEN CONFLICT", sub: "w/ Afghanistan", tone: "alert" },
        { label: "Inflation", value: "5.2%", sub: "cooled", tone: "up" },
        { label: "SBP Reserves", value: "$11.5B", sub: "~2mo cover", tone: "warn" },
        { label: "Remittances", value: "+10.5%", sub: "$19.7B", tone: "up" },
      ],
      analysis: [
        "Open conflict with Afghanistan. 23 killed in protests. Curfews in major cities (Karachi, Lahore, Peshawar, Gilgit-Baltistan).",
        "Trade deficit surged 25% to $25B in first 8 months of FY26. Exports down 7.3%. PKR under pressure from oil import costs.",
        "JazzCash processing PKR 15T (~13% of GDP) — digital payments booming. $1B AI fund. CPEC 2.0 digital corridor.",
        "Multi-front pressure: Afghanistan, Iran spillover, fiscal strain.",
      ],
    },
    {
      country: "Malaysia",
      flag: "🇲🇾",
      tag: "CURRENT LOCATION",
      metrics: [
        { label: "GDP", value: "4-5%", sub: "growth", tone: "up" },
        { label: "Inflation", value: "1.6%", sub: "core 2.3%", tone: "up" },
        { label: "Unemployment", value: "3.0%", sub: "RON95 RM1.99", tone: "up" },
        { label: "Politics", value: "PM AMEND FAIL", sub: "by 2 votes", tone: "warn" },
      ],
      analysis: [
        "Parliament failed to cap PM tenure at 10 years — fell 2 votes short. PM Anwar disclosed alleged foreign-backed destabilization plot.",
        "Strong condemnation of US-Israeli actions; diplomatic shift toward Iran in trade/education.",
        "Dual 5G rollout. AI/cloud hub ambitions vs Singapore and Indonesia. State elections in Johor, Melaka, Sarawak upcoming.",
        "Tengku Zafrul appointed Senior Political Adviser. UMNO elections March 2026.",
      ],
    },
  ],
  weakSignals: [
    { title: "New START treaty expired — no nuclear framework", risk: "HIGH", body: "For the first time since the Cold War, no nuclear arms control agreement exists between US and Russia. Near-zero mainstream coverage relative to its significance. Creates a new nuclear arms race dynamic." },
    { title: "China 15th Five-Year Plan — self-reliance", risk: "MEDIUM", body: "Final version publishing March 2026. Emphasis on national security and tech self-reliance signals acceleration of decoupling from Western supply chains. Watch rare earth export controls." },
    { title: "South Korea 12% crash — structural signal?", risk: "HIGH", body: "Not just Iran-driven. Energy dependency (99.5% import) + semiconductor concentration make Korea a canary for supply chain disruption affecting global AI hardware timelines." },
    { title: "Pakistan fintech processing 13% of GDP", risk: "LOW", body: "JazzCash alone processing PKR 15T is extraordinary for a country 95% cash-based 5 years ago. Adoption may outpace regulation. Opportunity for embedded finance, micro-lending, digital banking." },
    { title: "Physical AI market — €430B by 2030", risk: "LOW", body: "Shift from digital-only to physical AI (robotics, autonomous systems) accelerating faster than consensus. New semiconductor architectures designed for edge inference. First-mover window now." },
  ],
  opportunities: [
    { asset: "Korean equities post-crash", action: "WATCH", horizon: "SHORT-TERM", confidence: "MEDIUM", body: "KOSPI crashed 12.1%. If Hormuz resolves quickly, Korean tech/semiconductor rebounds sharply. Samsung, SK Hynix at distressed prices. Tactical if you believe the crisis is temporary." },
    { asset: "AMD stock — Meta deal catalyst", action: "BUY", horizon: "MEDIUM-TERM", confidence: "HIGH", body: "$60B Meta partnership is transformative. Stock likely to re-rate as Wall Street models recurring revenue. AMD Ryzen AI 400 outperforming Intel positions them for on-device AI." },
    { asset: "Gold — continued safe-haven run", action: "BUY", horizon: "MEDIUM-TERM", confidence: "HIGH", body: "At $5,170 but trajectory points to $5,300-5,500. No nuclear framework + Middle East escalation + tariff uncertainty = structural demand. Central banks net buyers." },
    { asset: "Pakistan fintech / digital payments", action: "WATCH", horizon: "LONG-TERM", confidence: "MEDIUM", body: "230M people rapidly going cashless. JazzCash at 13% of GDP. $1B AI fund. Embedded finance, digital lending, payment infra have massive TAM. Few foreign investors paying attention." },
    { asset: "Physical AI / Edge AI hardware", action: "WATCH", horizon: "LONG-TERM", confidence: "MED-HIGH", body: "€430B market by 2030. Qualcomm Dragonwing at 77 TOPS on-device. Companies building silicon for robotics/automation at an inflection point. Watch Qualcomm, GaN semiconductor companies." },
  ],
  predictions: [
    { horizon: "3 MONTH", event: "Iran crisis", prediction: "De-escalates to cold standoff within 3-4 weeks. Hormuz reopens with increased insurance premiums.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "3 MONTH", event: "Pakistan-Afghanistan", prediction: "Intermittent conflict but does not become full-scale war. Diplomatic backchannel opens via China.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "3-6 MONTH", event: "S&P 500", prediction: "Reaches 7,200 by June if Iran crisis resolved and Fed signals H2 cuts.", confidence: "MEDIUM", status: "BULLISH" },
    { horizon: "3-6 MONTH", event: "Gold", prediction: "Pushes to $5,500 by mid-year on sustained geopolitical uncertainty and central bank buying.", confidence: "MEDIUM", status: "BULLISH" },
    { horizon: "3-6 MONTH", event: "Bitcoin", prediction: "Tests $100K if macro improves post-Fed. Fails if recession probability rises above 40%.", confidence: "MEDIUM", status: "WATCH" },
    { horizon: "6-12 MONTH", event: "AI infrastructure", prediction: "Spending exceeds $500B globally in 2026. Margin pressure begins in H2 as competition intensifies.", confidence: "MED-HIGH", status: "ACTIVE" },
  ],
  analystNote:
    "Narrative shifts to watch: 'de-globalization' is being tested (SCOTUS tariff ruling + Paris talks suggest a swing back toward managed trade); the AI bubble narrative is gaining traction (Chatham House warned of turbulence from AI under-delivery); and nuclear risk is underpriced — no arms control framework + Iran crisis + North Korea = highest nuclear risk since the Cuban Missile Crisis, and markets are not pricing it.",
  sources: ["Reuters", "Bloomberg", "Saxo Bank", "Chatham House", "JP Morgan", "Deloitte", "BeInCrypto", "Dawn", "Malay Mail", "CNA", "White & Case", "World Bank", "SiliconAngle"],
};

// Newest first.
export const EDITIONS: Edition[] = [ed_0429, ed_0402, ed_0307, ed_0306, ed_0305];

export function getEdition(id: string): Edition | undefined {
  return EDITIONS.find((e) => e.id === id);
}

export const LATEST = EDITIONS[0];
