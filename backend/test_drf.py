import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from rest_framework.request import Request
from rest_framework.views import APIView
print("Imported DRF successfully without auth errors!")
