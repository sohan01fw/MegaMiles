# MegaMiles Backend – Makefile
# Usage: make <target>

.PHONY: help dev shell freeze

help:
	@echo "Available commands:"
	@echo "  make dev       – Start the Django dev server (port 8000)"
	@echo "  make shell     – Open Django shell"
	@echo "  make freeze    – Update requirements.txt"

dev:
	. venv/bin/activate && python manage.py runserver 0.0.0.0:8000

shell:
	. venv/bin/activate && python manage.py shell

freeze:
	. venv/bin/activate && pip freeze > requirements.txt
