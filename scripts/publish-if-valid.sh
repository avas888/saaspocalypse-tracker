#!/usr/bin/env bash
# Guardrail: Publish (commit + push) only if ALL data is present.
# Exits 1 on validation failure — no push will occur.
set -e

echo "Guardrail: Validating ALL data before publish..."
if ! npm run fetch:validate; then
  echo "❌ BLOCKED: Publish aborted — data validation failed. Fix missing tickers before pushing."
  exit 1
fi

echo "✅ Guardrail passed: all data present. Proceeding with publish..."
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add data/

if git diff --staged --quiet; then
  echo "No data changes to publish"
else
  git commit -m "chore: refresh price data [skip ci]"
  git push
  echo "✅ Published (deploy triggered)"
fi
