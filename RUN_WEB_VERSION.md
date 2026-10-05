# Run the Joberzzz web version

## Backend (Django + DRF)
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser                        # optional, for /admin/
python manage.py runserver 8000
python manage.py test                                   # authorization/security tests

## Frontend (existing Vite app, unchanged UI)
npm install
cp .env.example .env.local                              # VITE_API_URL=http://localhost:8000/api
npm run dev                                             # http://localhost:3000

Production: set DJANGO_SECRET_KEY, DJANGO_DEBUG=0, ALLOWED_HOSTS, CORS_ORIGINS, POSTGRES_* env vars.
