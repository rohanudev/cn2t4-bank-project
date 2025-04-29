from .base import *

# load_dotenv(dotenv_path=BASE_DIR / '.env_dev')
# os.getenv("KEYWORD")

DATABASES = {
    'default': {
        'ENGINE': os.getenv("DB_ENGINE"),
        'NAME': os.getenv("DB_NAME"),
        'USER': os.getenv("DB_USER_DEV"),
        'PASSWORD': os.getenv("DB_PASSWORD_DEV"),
        'HOST': os.getenv("DB_HOST_DEV"),
        'PORT': os.getenv("DB_PORT_DEV"),
        'TEST': {
            'NAME': os.getenv("DB_OPTIONS_NAME_DEV")
        }
    }
}