# MegaMiles Backend – Makefile
# Usage: make <target>

.PHONY: help dev migrate shell freeze

help:
	@echo "Available commands:"
	@echo "  make dev       – Start the Django dev server (port 8000)"
	@echo "  make migrate   – Run Django migrations"
	@echo "  make shell     – Open Django shell"
	@echo "  make freeze    – Update requirements.txt"
	@echo "  make prisma-push   – Push Prisma schema to Supabase DB"
	@echo "  make prisma-gen    – Generate Prisma Python client"

dev:
	. venv/bin/activate && python manage.py runserver 0.0.0.0:8000

migrate:
	. venv/bin/activate && python manage.py makemigrations && python manage.py migrate

shell:
	. venv/bin/activate && python manage.py shell

freeze:
	. venv/bin/activate && pip freeze > requirements.txt

prisma-push:
	. venv/bin/activate && prisma db push

prisma-gen:
	. venv/bin/activate && prisma generate
