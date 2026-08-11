"""
Django settings for config project.
"""

from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# ==================================================
# SECURITY
# ==================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-dev-key-change-me",
)

DEBUG = os.getenv("DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "127.0.0.1,localhost",
    ).split(",")
    if host.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]


# ==================================================
# PRODUCTION SECURITY
# ==================================================

if not DEBUG:
    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_HSTS_SECONDS = int(
        os.getenv(
            "SECURE_HSTS_SECONDS",
            "3600",
        )
    )

    SECURE_HSTS_INCLUDE_SUBDOMAINS = (
        os.getenv(
            "SECURE_HSTS_INCLUDE_SUBDOMAINS",
            "True",
        ).lower()
        == "true"
    )

    SECURE_HSTS_PRELOAD = (
        os.getenv(
            "SECURE_HSTS_PRELOAD",
            "False",
        ).lower()
        == "true"
    )

    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )


# ==================================================
# APPLICATIONS
# ==================================================

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "django_ckeditor_5",
    "drf_spectacular",

    # Local apps
    "accounts",
    "coaches",
    "gyms",
    "programs",
    "requests_app",
    "articles",
    "core",
    "contact",
    "reviews",
]


# ==================================================
# MIDDLEWARE
# ==================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ==================================================
# URLS / WSGI
# ==================================================

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ==================================================
# TEMPLATES
# ==================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ==================================================
# DATABASE
# ==================================================

# PostgreSQL en production si DB_ENGINE=postgresql,
# sinon SQLite en développement.

if os.getenv("DB_ENGINE") == "postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": os.getenv(
                "DB_HOST",
                "localhost",
            ),
            "PORT": os.getenv(
                "DB_PORT",
                "5432",
            ),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# ==================================================
# PASSWORD VALIDATION
# ==================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ==================================================
# INTERNATIONALIZATION
# ==================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Africa/Kigali"

USE_I18N = True

USE_TZ = True


# ==================================================
# STATIC / MEDIA
# ==================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ==================================================
# DEFAULT PRIMARY KEY
# ==================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ==================================================
# CUSTOM USER MODEL
# ==================================================

AUTH_USER_MODEL = "accounts.User"


# ==================================================
# DJANGO REST FRAMEWORK
# ==================================================

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": (
        "drf_spectacular.openapi.AutoSchema"
    ),

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
}


# ==================================================
# CORS
# ==================================================

CORS_ALLOW_CREDENTIALS = True


# ==================================================
# EMAIL
# ==================================================

EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)

EMAIL_HOST = os.getenv(
    "EMAIL_HOST",
    "",
)

EMAIL_PORT = int(
    os.getenv(
        "EMAIL_PORT",
        "587",
    )
)

EMAIL_HOST_USER = os.getenv(
    "EMAIL_HOST_USER",
    "",
)

EMAIL_HOST_PASSWORD = os.getenv(
    "EMAIL_HOST_PASSWORD",
    "",
)

EMAIL_USE_TLS = (
    os.getenv(
        "EMAIL_USE_TLS",
        "True",
    ).lower()
    == "true"
)

EMAIL_USE_SSL = (
    os.getenv(
        "EMAIL_USE_SSL",
        "False",
    ).lower()
    == "true"
)

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    "RwandaFitness <noreply@rwandafitness.com>",
)

CONTACT_NOTIFICATION_EMAIL = os.getenv(
    "CONTACT_NOTIFICATION_EMAIL",
    "rwandafitness@gmail.com",
)


# ==================================================
# FRONTEND
# ==================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)


# ==================================================
# CKEDITOR 5
# ==================================================

CKEDITOR_5_CONFIGS = {
    "default": {
        "toolbar": [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "|",
            "insertTable",
            "imageUpload",
            "|",
            "undo",
            "redo",
        ],
    },
}


# ==================================================
# DRF SPECTACULAR
# ==================================================

SPECTACULAR_SETTINGS = {
    "TITLE": "RwandaFitness API",
    "DESCRIPTION": "Official API for RwandaFitness",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}