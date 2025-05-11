#!/bin/bash

# 현재 디렉토리를 Trivy 스캔 대상으로 설정
TARGET_DIR="."

# 결과 파일은 현재 디렉토리에 저장
OUTPUT_FILE="trivy-results.sarif"

# Trivy Docker 컨테이너로 스캔 실행
docker run --rm \
  -v "$(pwd):/project" \
  -w /project \
  aquasec/trivy:latest \
  fs "$TARGET_DIR" \
  --format sarif \
  --output "$OUTPUT_FILE"

echo "✅ Trivy 스캔 완료: $OUTPUT_FILE"