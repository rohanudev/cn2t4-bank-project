# zap-run-scan.sh

# ZAP 데몬이 올라올 때까지 기다림
while ! curl -s http://localhost:8090; do
  echo "Waiting for ZAP to start..."
  sleep 3
done

# 1. OpenAPI 명세 등록
curl "http://localhost:8090/JSON/openapi/action/importFile/?file=/zap/wrk/schema.json"

# 2. 스캔 시작
SCAN_ID=$(curl -s "http://localhost:8090/JSON/ascan/action/scan/?url=http://django_backend:8000" | jq -r '.scan')

# 3. 상태 모니터링
while true; do
  STATUS=$(curl -s "http://localhost:8090/JSON/ascan/view/status/?scanId=$SCAN_ID" | jq -r '.status')
  echo "Scan progress: $STATUS%"
  [ "$STATUS" = "100" ] && break
  sleep 5
done

# 4. 리포트 출력
curl "http://localhost:8090/OTHER/core/other/htmlreport/" -o /zap/wrk/zap_report.html