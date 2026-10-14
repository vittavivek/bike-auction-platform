# MotoBid — Bike Auction Platform

MotoBid is a web-based motorcycle auction platform where users can explore motorcycle listings, register accounts, log in securely, and place bids on live auctions.

## Features

- User registration and login
- JWT-based authentication
- Motorcycle auction listings and search
- Auction creation restricted to administrators
- Bid placement with minimum-increment validation
- Auction time-window validation
- PostgreSQL database integration
- Automated API tests using pytest

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS

**Backend:** Python, FastAPI, SQLAlchemy

**Database:** PostgreSQL (Supabase)

**Authentication:** JWT, Argon2 password hashing

**Testing:** pytest, FastAPI TestClient

## Project Structure

```text
bike-auction-platform/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── auth_schemas.py
│   ├── database.py
│   └── test_main.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Running Locally in GitHub Codespaces

### Backend

Activate the Python virtual environment and start FastAPI:

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API documentation is available at `/docs` on the backend URL.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the forwarded frontend port in Codespaces.

## Environment Configuration

Configure the database connection and JWT signing key using Codespaces secrets or environment variables. Never commit passwords, database credentials, access tokens, or signing keys to Git.

## Running Tests

From the repository root:

```bash
source .venv/bin/activate
python -m pytest backend/test_main.py -v
```

## Current Test Coverage

The automated tests cover the home endpoint, health endpoint, unknown routes, auction listing, authentication enforcement for bidding, and zero-value bid rejection.

## Future Improvements

- Real-time auction updates using WebSockets
- Bid history for each auction
- Auction countdown timers
- Additional integration and concurrency tests
- Improved error handling and deployment configuration