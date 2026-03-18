# MegaMiles – Django Backend

Scalable, modular Django + DRF backend. CORS pre-configured for the React/Vite frontend.

---

## 📂 Project Structure

```
backend/
├── apps/                   # Feature-scoped Django apps
│   ├── health/             # Ping + Hello World (smoke tests)
│   ├── users/              # User logic
│   └── trips/              # Core trip management
├── config/
│   ├── settings/
│   │   ├── base.py         # Shared settings (DRF, CORS, apps)
│   │   ├── development.py  # Dev overrides (DEBUG=True, open CORS)
│   │   └── production.py   # Prod hardening (HTTPS, HSTS)
│   ├── api_router.py       # Central URL assembler for /api/v1/
│   ├── urls.py             # Root URLconf
│   └── wsgi.py
├── .env                    # Local secrets (NOT committed)
├── .env.example            # Template – commit this
├── manage.py
├── Makefile
└── requirements.txt
```

---

## 🚀 Quick Start

### 1. Activate the virtual environment
```bash
cd backend
source venv/bin/activate
```

### 2. Configure environment variables
Edit `.env` and fill in your secrets:
```
SECRET_KEY=your-secret-key-here
```

### 3. Run the dev server
```bash
python manage.py runserver
# or: make dev
```

---

## 🧪 Postman – Test Endpoints

| Method | URL | What it does |
|--------|-----|--------------|
| `GET` | `http://localhost:8000/api/v1/health/ping/` | Returns `{"status":"ok","message":"pong 🏓"}` |
| `GET` | `http://localhost:8000/api/v1/health/hello/` | Returns `{"status":"ok","message":"Hello from MegaMiles API 🚀","django_version":"...","debug":true}` |

---

## 🌐 CORS

CORS is handled by `django-cors-headers`. In **development**, all origins are allowed (`CORS_ALLOW_ALL_ORIGINS = True` in `development.py`).

In **production**, only origins listed in `.env`'s `CORS_ALLOWED_ORIGINS` are whitelisted.

---

## ➕ Adding a New App

1. `python manage.py startapp <name> apps/<name>`
2. Update `apps/<name>/apps.py` → set `name = "apps.<name>"` and `label = "<name>"`
3. Add `"apps.<name>"` to `LOCAL_APPS` in `config/settings/base.py`
4. Create `apps/<name>/urls.py` and register it in `config/api_router.py`
