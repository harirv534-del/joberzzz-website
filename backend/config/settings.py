import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
INSTALLED_APPS = ["django.contrib.admin","django.contrib.auth","django.contrib.contenttypes",
  "django.contrib.sessions","django.contrib.messages","rest_framework","rest_framework.authtoken",
  "corsheaders","core"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware","django.middleware.security.SecurityMiddleware",
  "django.contrib.sessions.middleware.SessionMiddleware","django.middleware.common.CommonMiddleware",
  "django.middleware.csrf.CsrfViewMiddleware","django.contrib.auth.middleware.AuthenticationMiddleware",
  "django.contrib.messages.middleware.MessageMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND":"django.template.backends.django.DjangoTemplates","APP_DIRS":True,
  "OPTIONS":{"context_processors":["django.template.context_processors.request",
  "django.contrib.auth.context_processors.auth","django.contrib.messages.context_processors.messages"]}}]
DATABASES = {"default": {"ENGINE":"django.db.backends.sqlite3","NAME":BASE_DIR/"db.sqlite3"}}
if os.environ.get("POSTGRES_DB"):
    DATABASES["default"] = {"ENGINE":"django.db.backends.postgresql","NAME":os.environ["POSTGRES_DB"],
      "USER":os.environ.get("POSTGRES_USER","postgres"),"PASSWORD":os.environ.get("POSTGRES_PASSWORD",""),
      "HOST":os.environ.get("POSTGRES_HOST","localhost"),"PORT":os.environ.get("POSTGRES_PORT","5432")}
AUTH_USER_MODEL = "core.User"
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
# Resumes live OUTSIDE any served directory: never exposed by URL, only via authorized view.
PRIVATE_MEDIA_ROOT = BASE_DIR / "private_media"
MEDIA_ROOT = PRIVATE_MEDIA_ROOT
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ORIGINS","http://localhost:3000,http://127.0.0.1:3000").split(",")
REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.TokenAuthentication"],
  "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}
DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
