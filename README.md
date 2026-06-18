# Ethara Inventory Orders

A full-stack product, customer, and order management app built with FastAPI, React, PostgreSQL, and Docker.

## Features

- Product CRUD with unique SKU enforcement.
- Customer CRUD with unique email enforcement.
- Order creation with inventory validation.
- Automatic stock reduction in a database transaction when an order is placed.
- PostgreSQL persistence with environment-based configuration.
- Responsive React UI for products, customers, and orders.
- Docker Compose setup for database, backend, and frontend.

## Run Locally With Docker

1. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Update `.env` if needed, then start the stack:

   ```powershell
   docker compose up --build
   ```

3. Open:

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

Do not run `etharaai-backend:latest` alone from Docker Desktop unless you also provide a reachable PostgreSQL database URL. The backend container needs this environment variable:

```powershell
DATABASE_URL=postgresql+psycopg://ethara:change-me@db:5432/ethara
```

The host name `db` works when the backend is started by `docker compose` because Compose creates that service network. If you run the backend image manually, use Compose instead or attach the container to the same network and pass the correct `DATABASE_URL`.

## Run Without Docker

Backend:

```powershell
cd backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL="postgresql+psycopg://ethara:change-me@localhost:5432/ethara"
uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Deployment Notes

Current no-cost deployment path for an assessment/demo:

- Backend: Render Web Service on the free instance type, or any host that accepts the backend Dockerfile.
- PostgreSQL: Neon Free plan, or Render Postgres Free for short-lived demos.
- Frontend: Vercel Hobby plan or Render Static Site.

Set these environment variables in production:

- `DATABASE_URL`
- `BACKEND_CORS_ORIGINS`
- `VITE_API_BASE_URL`

Example Docker image publish flow:

```powershell
docker build -t your-dockerhub-user/ethara-backend:latest ./backend
docker push your-dockerhub-user/ethara-backend:latest
```

For Render backend deployment, set:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

For Vercel frontend deployment, set:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- `VITE_API_BASE_URL`: your deployed backend URL

## Submission Checklist

- GitHub repository link: add after pushing this project.
- Docker image link: add after publishing the backend image.
- Live frontend URL: add after deploying the frontend.
- Live backend URL: add after deploying the backend.
