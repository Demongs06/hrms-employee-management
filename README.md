# HRMS Employee Management

A single-organization HRMS demo built with React, Express, MongoDB and Cloudinary.

## Project structure

- `frontend/` — React 19 + Vite application
- `backend/` — Express API, MongoDB persistence and private Cloudinary payslip storage

## Run locally

### Backend

1. Open a terminal in `backend/`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and configure MongoDB, JWT, Cloudinary and administrator credentials.
4. Run `npm start`.

The API listens on `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

### Frontend

1. Open a second terminal in `frontend/`.
2. Run `npm install`.
3. Create `.env.local` with `VITE_API_URL=http://localhost:5000`.
4. Run `npm run dev`.

## Deploy

### Netlify

The root `netlify.toml` configures the `frontend` base directory, frontend tests, `npm run build`, `dist` publish directory, SPA fallback and browser security headers. Set `VITE_API_URL` to the deployed Render API origin.

### Render

The Render web service uses `backend` as its root directory and runs `npm install && npm test` before deployment. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` and the required admin credentials in Render's environment settings. Add the Cloudinary credentials to enable payslip storage. Never commit `.env` files or paste credentials into GitHub.

## Demo accounts

The public demo employee account is:

- Email: `employee@test.com`
- Password: `Employee123`

The employee is created idempotently at backend startup when `DEMO_MODE=true`, `DEMO_EMPLOYEE_EMAIL` and `DEMO_EMPLOYEE_PASSWORD` are configured. The demo database should contain fictional records only.

## Tests

- Backend: `cd backend && npm test` (Node's built-in test runner)
- Frontend: `cd frontend && npm run test -- --run`
- Frontend production build: `cd frontend && npm run build`

GitHub Actions runs backend tests, frontend tests and the frontend build on pushes and pull requests to `main`.

## Demo safety

Use a dedicated MongoDB database for the public demo. Do not put real employee or payroll information in it. Payslip PDFs are stored as authenticated Cloudinary raw assets and served through short-lived signed URLs.

This project is intended as a portfolio demo. Before any real payroll use, separately review security, backups, audit requirements, access controls, retention and operational availability. Free hosting does not provide production availability or backup guarantees.
