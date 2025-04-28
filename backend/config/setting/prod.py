from .base import *

DATABASES = {
    'default': {
        'ENGINE': os.getenv("DB_ENGINE"),
        'NAME': os.getenv("DB_NAME"),
        'USER': os.getenv("DB_USER"),
        'PASSWORD': os.getenv("DB_PASSWORD"),
        'HOST': os.getenv("DB_HOST"),
        'PORT': os.getenv("DB_PORT"),
        'OPTIONS': {
            'charset': os.getenv("DB_CHARSET"),
            'init_command': os.getenv("DB_INIT_COMMAND"),
        },
    }
}