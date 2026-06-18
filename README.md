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
