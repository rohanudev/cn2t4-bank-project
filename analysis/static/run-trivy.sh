#!/bin/bash
echo "🔍 Running Trivy security scan..."

REPORT_PATH=./analysis/static/report/trivy_report.json

docker run --name trivy \
  -v ./:/project \
  -w /project \
  aquasec/trivy:latest fs . \
    --format json --output /home/trivy_report.json

docker cp trivy:/home/trivy_report.json $REPORT_PATH
docker rm -f trivy

REPORT_PATH=./analysis/static/report/trivy_report.json

# Secrets에서 CRITICAL 개수 추출
CRITICAL_SECRET_COUNT=$(jq '[.Results[] | select(.Secrets != null) | .Secrets[] | select(.Severity == "CRITICAL")] | length' "$REPORT_PATH")

echo "🔐 CRITICAL secrets: $CRITICAL_SECRET_COUNT"

# 실패 조건
if [ "$CRITICAL_SECRET_COUNT" -gt 0 ]; then
  echo "❌ CI failed: CRITICAL secrets detected."
  exit 1
else
  echo "✅ No critical secrets found."
fi
