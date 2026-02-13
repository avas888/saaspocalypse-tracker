#!/usr/bin/env bash
# Unified update procedure — keeps ALL project tabs coherent.
# Run: npm run update
# Order matters: price data → LTM → daily → repair → ancillary → validate.

set -e
cd "$(dirname "$0")/.."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SaaSpocalypse Tracker — Full Update"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Price data: baseline + backfill dailies
echo "1/7  Baseline + backfill daily snapshots..."
npm run fetch:backfill
echo ""

# 2. LTM high (sector calculations depend on this)
echo "2/7  LTM high (sector avg drop, company drops)..."
npm run fetch:ltm
echo ""

# 3. Today's daily snapshot (force = overwrite if exists)
echo "3/7  Today's daily snapshot..."
npm run fetch:force
echo ""

# 4. Repair any missing tickers (e.g. international markets)
echo "4/7  Repair missing tickers in daily files..."
npm run fetch:repair
echo ""

# 5. Private company health (optional, may fail without NEWS_API_KEY)
echo "5/7  Private company health..."
npm run fetch:private 2>/dev/null || echo "  ⏭ Skipped (NEWS_API_KEY not set)"
echo ""

# 6. Sector news (optional)
echo "6/7  Sector news..."
npm run fetch:sector-news 2>/dev/null || echo "  ⏭ Skipped"
echo ""

# 7. Validate coherence
echo "7/7  Validating coherence..."
npm run fetch:validate
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Update complete. All tabs are coherent."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
