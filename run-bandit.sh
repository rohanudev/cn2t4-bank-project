#!/bin/bash

# 경로 설정
PROJECT_ROOT=$(pwd)
OUTPUT_SARIF="$PROJECT_ROOT/bandit-report.json"

echo "🔍 Running Bandit (Python static analysis) in a virtual environment..."

# 가상 환경 생성 및 활성화
python3 -m venv env
source env/bin/activate

# Bandit 설치 및 실행
pip install --upgrade pip
pip install --no-cache-dir 'bandit==1.7.8'
bandit -r backend -f json -o "$OUTPUT_SARIF"

# 가상 환경 비활성화
deactivate

# 결과 확인
if [ -f "$OUTPUT_SARIF" ]; then
  echo "✅ Bandit SARIF report saved to: $OUTPUT_SARIF"
else
  echo "❌ Bandit report not generated."
  exit 1
fi