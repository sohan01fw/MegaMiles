"""
config/settings/development.py
-------------------------------
Development-specific settings. Inherits everything from base.
"""
from .base import *  # noqa: F401, F403

DEBUG = False

# Show full error output in dev
CORS_ALLOW_ALL_ORIGINS = True  # relax for local dev – base still restricts in prod
