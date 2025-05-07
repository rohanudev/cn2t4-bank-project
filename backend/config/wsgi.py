"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""
import telemetry.setup
import os
from pathlib import Path
from dotenv import load_dotenv  # 추가
from django.core.wsgi import get_wsgi_application


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / '.env')  # 추가
env = os.getenv('DJANGO_ENV', 'development')

if env == 'PROD':
    settings_module = 'config.setting.prod'
else:
    settings_module = 'config.setting.dev'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
application = get_wsgi_application()
