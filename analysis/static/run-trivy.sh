#!/bin/bash

# 절대 경로 설정
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../../")
REPORT_DIR="$SCRIPT_DIR/reports"
OUTPUT_FILE="$REPORT_DIR/trivy-results.sarif"

mkdir -p "$REPORT_DIR"

echo "🔍 Running Trivy security scan..."

docker run --rm \
  -v "$PROJECT_ROOT":/project \
  -w /project \
  aquasec/trivy:latest \
  fs . \
  --format sarif \
  --output "/project/analysis/static/reports/trivy-results.sarif"

if [ -f "$OUTPUT_FILE" ]; then
  echo "✅ Trivy SARIF saved to: $OUTPUT_FILE"
else
  echo "❌ Trivy SARIF not generated."
  exit 1
fi