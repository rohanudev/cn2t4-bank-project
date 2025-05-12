#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../../")
REPORT_DIR="$SCRIPT_DIR/reports"
OUTPUT_JSON="$REPORT_DIR/bandit-results.json"

mkdir -p "$REPORT_DIR"

echo "🔍 Running Bandit in Docker..."

docker run --rm \
  -v "$PROJECT_ROOT":/app \
  -w /app \
  python:3.11-slim bash -c "
    pip install --no-cache-dir --upgrade pip &&
    pip install --no-cache-dir bandit &&
    bandit -r backend \
      --format json \
      --output /app/analysis/static/reports/bandit-results.json
  "

if [ -f "$OUTPUT_JSON" ]; then
  echo "✅ Bandit JSON saved to: $OUTPUT_JSON"
else
  echo "❌ Bandit JSON not generated."
  exit 1
fi