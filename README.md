# MotoBid — Bike Auction Platform

A full-stack motorcycle auction platform where registered users can browse used motorcycles, authenticate securely, and participate in auctions by placing validated bids.

## 🔗 Live Demo

- **Frontend:** https://bike-auction-platform-mauve.vercel.app/
- **Backend API:** https://motobid-api.onrender.com
- **API Documentation (Swagger):** https://motobid-api.onrender.com/docs
- **Health Check:** https://motobid-api.onrender.com/health
- **Source Code:** https://github.com/vittavivek/bike-auction-platform

## ✨ Features

- Browse and search motorcycle auctions.
- User registration and login using JWT authentication.
- View current prices and minimum bid increments.
- Submit bids with server-side validation.
- Persistent storage using PostgreSQL.
- Admin-protected auction creation.
- REST API built with FastAPI.
- Responsive frontend built with React and Vite.

## 🛠️ Tech Stack

**Frontend:** React, Vite, JavaScript, CSS  
**Backend:** Python, FastAPI, SQLAlchemy  
**Database:** PostgreSQL (Supabase)  
**Authentication:** JWT, Argon2 password hashing  
**Deployment:** Vercel (frontend), Render (backend), Supabase (database)  
**Testing:** pytest

## 🏗️ Architecture

1. The React frontend is hosted on Vercel.
2. The frontend sends HTTP requests to the FastAPI backend hosted on Render.
3. FastAPI validates authentication, auction operations, and bids.
4. SQLAlchemy communicates with the PostgreSQL database hosted on Supabase.
5. JWT bearer tokens protect authenticated endpoints.

## 🚀 Local Setup

### Prerequisites

- Python 3.11 or compatible version
- Node.js and npm
- A PostgreSQL database or Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/vittavivek/bike-auction-platform.git
cd bike-auction-platform
```

### 2. Configure the backend

Create and activate a virtual environment, then install dependencies.

```bash
python -m venv .venv
```

Activate it:

**Windows**
```bash
.venv\Scripts\activate
```

**macOS/Linux**
```bash
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the following environment variables using your own database credentials and a secure JWT secret:

```text
DB_HOST=
DB_PORT=
DB_USER=
DB_NAME=
DATABASE_PASSWORD=
JWT_SECRET_KEY=
```

Never commit real secrets or passwords to the repository.

Start the backend from the repository root:

```bash
uvicorn backend.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```text
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

## 🧪 Run Tests

From the repository root, activate the Python virtual environment and run:

```bash
python -m pytest backend/test_main.py -v
```

## 🔐 Demo Access

Use the dedicated demo account credentials provided separately to the evaluator. Do not publish passwords, JWT secrets, or database credentials in this repository.

If a demo admin account is provided, use it only for testing administrative functionality.

## ⚙️ Deployment

- **Frontend:** Deploy the `frontend/` directory through Vercel using the Vite framework preset. Set `VITE_API_URL` to the deployed backend URL.
- **Backend:** Deploy the repository on Render using `pip install -r requirements.txt` as the build command and `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` as the start command.
- **Database:** Configure the PostgreSQL connection details as Render environment variables. Keep all credentials in the hosting provider's environment settings.

Configure backend CORS to allow the intended frontend origin.

## 📝 Assumptions and Trade-offs

- PostgreSQL is used for persistent auction, user, and bid data.
- The backend is authoritative for validating bids and updating auction prices.
- JWT bearer authentication is used for protected operations.
- The initial implementation prioritizes core auction flows and a straightforward deployment architecture.
- Real-time push updates, automated auction lifecycle scheduling, and expanded observability should be documented as completed only after implementation and verification.

## 📌 Future Improvements

- WebSocket-based live bidding updates.
- Automated auction lifecycle transitions and countdowns.
- Bid history and auction activity feeds.
- Expanded integration and concurrency testing.
- Structured logging, metrics, and monitoring.
