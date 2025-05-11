#!/bin/bash

# 경로 설정
PROJECT_ROOT=$(pwd)
FRONTEND_DIR="$PROJECT_ROOT/frontend"
OUTPUT_SARIF="$PROJECT_ROOT/eslint-results.sarif"

echo "🚀 Running ESLint in temporary Docker container..."

docker run --rm \
  -v "$PROJECT_ROOT":/app \
  -w /app \
  node:18 bash -c "
    npm init -y >/dev/null &&
    npm install --save-dev eslint@9 @microsoft/eslint-formatter-sarif >/dev/null &&
    npx eslint ./frontend \
      --format @microsoft/eslint-formatter-sarif \
      --output-file eslint-results.sarif
  "

# 결과 확인
if [ -f "$OUTPUT_SARIF" ]; then
  echo "✅ ESLint SARIF result saved to: $OUTPUT_SARIF"
else
  echo "❌ SARIF file not generated."
  exit 1
fi