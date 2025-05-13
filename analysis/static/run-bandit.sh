#!/bin/bash
echo "🔍 Running Bandit in Docker..."

REPORT_PATH=./analysis/static/report/bandit_report.json

mkdir -p ./analysis/static/report

docker run --name bandit \
  -v ./backend:/app \
  python:3.11-slim \
  bash -c "
    mkdir -p /home/report &&
    pip install bandit &&
    bandit -r /app \
      --exclude /app/tests,/app/**/tests \
      --format json \
      --output /home/report/bandit_report.json
  "

docker cp bandit:/home/report/bandit_report.json $REPORT_PATH
docker rm -f bandit

jq '[.results[] | .issue_severity] | group_by(.) | map({(.[0]): length}) | add' $REPORT_PATH
HIGH_COUNT=$(jq '[.results[] | select(.issue_severity == "HIGH")] | length' $REPORT_PATH)

echo "⚠️ High severity findings: $HIGH_COUNT"

if [ "$HIGH_COUNT" -ge 1 ]; then
  echo "❌ CI failed: High severity issues found in Bandit report."
  exit 1
else
  echo "✅ Bandit check passed: No high severity issues."
fi