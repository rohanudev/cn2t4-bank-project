import logging
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk._logs import LoggerProvider, set_logger_provider
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, OTLPLogExporter

# 서비스 이름, 환경 변수 등 메타데이터
resource = Resource(attributes={
    "service.name": "django-backend",
    "service.namespace": "cn2t4-bank-project",
    "deployment.environment": "local",
})

# 로그 provider 설정
logger_provider = LoggerProvider(resource=resource)
set_logger_provider(logger_provider)

# OTLP 로그 Exporter (Collector로 전송)
otlp_exporter = OTLPLogExporter(endpoint="http://otel_collector:4317", insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(otlp_exporter))

# Python 표준 logging과 연결
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
logging.getLogger().addHandler(handler)

from opentelemetry.sdk.trace.export import BatchSpanProcessor, OTLPSpanExporter

# Tracer provider 설정
trace_provider = TracerProvider(resource=resource)
trace.set_tracer_provider(trace_provider)

# OTLP trace Exporter (Collector로 전송)
otlp_span_exporter = OTLPSpanExporter(endpoint="http://otel_collector:4317", insecure=True)
span_processor = BatchSpanProcessor(otlp_span_exporter)
trace_provider.add_span_processor(span_processor)

from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.metrics import set_meter_provider

metric_exporter = OTLPMetricExporter(endpoint="http://otel_collector:4317", insecure=True)
reader = PeriodicExportingMetricReader(metric_exporter)
meter_provider = MeterProvider(metric_readers=[reader])
set_meter_provider(meter_provider)

meter = meter_provider.get_meter("django-backend")
# 예시 메트릭 생성
example_counter = meter.create_counter(
    name="example_counter",
    description="Example counter for testing",
)
example_counter.add(1, {"env": "local"})