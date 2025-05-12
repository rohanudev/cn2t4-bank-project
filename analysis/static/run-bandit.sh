#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../../")
REPORT_DIR="$SCRIPT_DIR/reports"
OUTPUT_SARIF="$REPORT_DIR/bandit-results.sarif"

mkdir -p "$REPORT_DIR"

echo "🔍 Running Bandit in Docker..."

docker run --rm \
  -v "$PROJECT_ROOT":/app \
  -w /app \
  python:3.11-slim bash -c "
    pip install --quiet bandit &&
    bandit -r backend \
      --format sarif \
      --output /app/analysis/static/reports/bandit-results.sarif
  "

if [ -f "$OUTPUT_SARIF" ]; then
  echo "✅ Bandit JSON saved to: $OUTPUT_SARIF"
else
  echo "❌ Bandit JSON not generated."
  exit 1
fi