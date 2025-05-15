#!/bin/bash

# 데몬 모드 실행
/zap/zap.sh -daemon -host 0.0.0.0 -port 8090 \
  -config "api.disablekey=true" \
  -config "api.addon=true" \
  -addoninstall replacer \
  -addoninstall openapi \
  -addoninstall ajaxSpider \
  -config "api.addrs.addr.name=.*" \
  -config "api.addrs.addr.regex=true" \
  -config "replacer.full_list(0).description=zap-skip-auth" \
  -config "replacer.full_list(0).enabled=true" \
  -config "replacer.full_list(0).matchtype=REQ_HEADER" \
  -config "replacer.full_list(0).matchstr=X-ZAP-SCAN" \
  -config "replacer.full_list(0).replacement=true" \
  -config "replacer.full_list(1).description=force-accept-json" \
  -config "replacer.full_list(1).enabled=true" \
  -config "replacer.full_list(1).matchtype=REQ_HEADER" \
  -config "replacer.full_list(1).matchstr=Accept" \
  -config "replacer.full_list(1).replacement=application/json" \
  -config "replacer.full_list(2).description=force-host" \
  -config "replacer.full_list(2).enabled=true" \
  -config "replacer.full_list(2).matchtype=REQ_HEADER" \
  -config "replacer.full_list(2).matchstr=Host" \
  -config "replacer.full_list(2).replacement=localhost"