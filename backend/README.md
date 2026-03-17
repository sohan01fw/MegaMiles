# MegaMiles – Django Backend

Scalable, modular Django + DRF backend. Data layer via **Prisma ORM** on **Supabase Postgres**. CORS pre-configured for the React/Vite frontend.

---

## 📂 Project Structure

```
backend/
├── apps/                   # Feature-scoped Django apps
│   ├── health/             # Ping + Hello World (smoke tests)
│   ├── users/              # User profile & auth integration
│   └── trips/              # Core trip management
├── config/
│   ├── settings/
│   │   ├── base.py         # Shared settings (DRF, CORS, apps)
│   │   ├── development.py  # Dev overrides (DEBUG=True, open CORS)
│   │   └── production.py   # Prod hardening (HTTPS, HSTS)
│   ├── api_router.py       # Central URL assembler for /api/v1/
│   ├── urls.py             # Root URLconf
│   └── wsgi.py
├── prisma/
│   └── schema.prisma       # Prisma schema → Supabase Postgres
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
Edit `.env` and fill in your Supabase connection string:
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.XXXX.supabase.co:5432/postgres?sslmode=require
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

No headers needed. Just hit those URLs in Postman.

---

## 🗄️ Prisma + Supabase Setup

### 1. Generate Prisma Python client
```bash
source venv/bin/activate
prisma generate
# or: make prisma-gen
```

### 2. Push schema to Supabase Postgres
```bash
prisma db push
# or: make prisma-push  ← recommended for development
```

### 3. Using the client in a view
```python
from prisma import Prisma

db = Prisma()

def my_view(request):
    db.connect()
    users = db.user.find_many()
    db.disconnect()
    ...
```

---

## 🌐 CORS

CORS is handled by `django-cors-headers`. In **development**, all origins are allowed (`CORS_ALLOW_ALL_ORIGINS = True` in `development.py`).

In **production**, only origins listed in `.env`'s `CORS_ALLOWED_ORIGINS` are whitelisted:
```env
CORS_ALLOWED_ORIGINS=https://megamiles.com,https://app.megamiles.com
```

---

## ➕ Adding a New App

1. `python manage.py startapp <name> apps/<name>`
2. Update `apps/<name>/apps.py` → set `name = "apps.<name>"` and `label = "<name>"`
3. Add `"apps.<name>"` to `LOCAL_APPS` in `config/settings/base.py`
4. Create `apps/<name>/urls.py` and register it in `config/api_router.py`
