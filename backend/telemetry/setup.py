import logging
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider

from opentelemetry.sdk._logs import LoggerProvider
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter

from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.metrics import set_meter_provider

# 서비스 메타데이터 설정
resource = Resource(attributes={
    "service.name": "django-backend",
    "service.namespace": "cn2t4-bank-project",
    "deployment.environment": "local",
})

# 로그 Provider 설정
logger_provider = LoggerProvider(resource=resource)
otlp_log_exporter = OTLPLogExporter(endpoint="http://otel_collector:4317", insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(otlp_log_exporter))

# Python 로깅과 연결
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
logging.getLogger().addHandler(handler)

# 트레이서 설정
trace_provider = TracerProvider(resource=resource)
trace.set_tracer_provider(trace_provider)

otlp_span_exporter = OTLPSpanExporter(endpoint="http://otel_collector:4317", insecure=True)
span_processor = BatchSpanProcessor(otlp_span_exporter)
trace_provider.add_span_processor(span_processor)

# 메트릭 설정
metric_exporter = OTLPMetricExporter(endpoint="http://otel_collector:4317", insecure=True)
reader = PeriodicExportingMetricReader(metric_exporter)
meter_provider = MeterProvider(metric_readers=[reader])
set_meter_provider(meter_provider)

# 메트릭 인스턴스
meter = meter_provider.get_meter("django-backend")
example_counter = meter.create_counter(
    name="example_counter",
    description="Example counter for testing",
)
example_counter.add(1, {"env": "local"})