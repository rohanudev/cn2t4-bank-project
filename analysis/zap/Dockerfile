FROM zaproxy/zap-stable

WORKDIR /zap

USER root
COPY zap-start.sh /zap/zap-start.sh
RUN chmod +x /zap/zap-start.sh
COPY zap-run-scan.sh /zap/zap-run-scan.sh
RUN chmod +x /zap/zap-run-scan.sh
USER zap

ENTRYPOINT ["/zap/zap-start.sh"]