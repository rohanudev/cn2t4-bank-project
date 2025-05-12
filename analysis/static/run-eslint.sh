#!/bin/bash

# 경로 설정
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../../")
REPORT_DIR="$SCRIPT_DIR/reports"
OUTPUT_SARIF="$REPORT_DIR/eslint-results.sarif"

mkdir -p "$REPORT_DIR"

echo "🚀 Running ESLint in Docker..."

docker run --rm \
  -v "$PROJECT_ROOT":/app \
  -w /app \
  node:18 bash -c "
    npm install --save-dev eslint@9 \
      @microsoft/eslint-formatter-sarif \
      @eslint/json >/dev/null &&
    npx eslint ./frontend \
      --format @microsoft/eslint-formatter-sarif \
      --output-file /app/analysis/static/reports/eslint-results.sarif
  "

if [ -f "$OUTPUT_SARIF" ]; then
  echo "✅ ESLint SARIF saved to: $OUTPUT_SARIF"
else
  echo "❌ ESLint SARIF not generated."
  exit 1
fi