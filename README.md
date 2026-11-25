# HRMS Employee Management

A single-organization HRMS demo built with React, Express, MongoDB and Cloudinary.

## Project structure

- `frontend/` — React 19 + Vite application
- `backend/` — Express API, MongoDB persistence and private Cloudinary payslip storage

## Run locally

### Backend

1. Open a terminal in `backend/`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and configure MongoDB, JWT, Cloudinary and admin/demo credentials.
4. Run `npm start`.

The API listens on `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

### Frontend

1. Open a second terminal in `frontend/`.
2. Run `npm install`.
3. Create `.env.local` with `VITE_API_URL=http://localhost:5000`.
4. Run `npm run dev`.

## Deploy

### Netlify

The root `netlify.toml` configures the `frontend` base directory, `npm run build`, `dist` publish directory and SPA fallback. Set `VITE_API_URL` to the deployed Render API origin.

### Render

The root `render.yaml` configures the backend service with `backend` as its root directory. Add the required secrets in Render's environment settings; never commit `.env` files or paste credentials into GitHub.

### Demo safety

Use a dedicated MongoDB database for the public demo, with `DEMO_MODE=true` and fictional demo accounts. Do not put real employee or payroll information in the public demo. Payslip PDFs are stored as authenticated Cloudinary raw assets and served through short-lived signed URLs.

This project is intended as a portfolio demo. Before any real payroll use, separately review security, backups, audit requirements, access controls, retention and operational availability. Free hosting does not provide production availability or backup guarantees.
