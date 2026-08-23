# Ironclad Motors — Car Dealership Inventory System

A full-stack inventory management system for a car dealership: a JWT-secured
REST API (Node.js/Express + SQLite) and a React + Tailwind single-page app
for browsing, searching, purchasing, and (for admins) managing vehicle stock.

Built as a TDD kata — see [`backend/tests`](backend/tests) for the specs
that drove the API, and the git history for the Red → Green → Refactor
pattern behind each feature.

## Table of contents

- [Project overview](#project-overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Setup and running locally](#setup-and-running-locally)
- [API reference](#api-reference)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [My AI Usage](#my-ai-usage)

## Project overview

Two independent apps, talking over a REST API:

- **`backend/`** — Express API. Handles registration/login (JWT), and
  full vehicle inventory CRUD, search, purchasing, and restocking. Data is
  persisted in a real SQLite file on disk (`backend/data/dealership.sqlite3`),
  not an in-memory store, so it survives a restart.
- **`frontend/`** — React SPA (Vite + Tailwind). Lets customers register,
  log in, browse/search inventory, and purchase vehicles (the Purchase
  button disables itself once stock hits zero). Admin accounts additionally
  get add/edit/delete/restock controls.

## Tech stack

| Layer      | Choice                                                        |
|------------|----------------------------------------------------------------|
| Backend    | Node.js, Express                                               |
| Database   | SQLite via `better-sqlite3` (file-backed, not in-memory)        |
| Auth       | JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)     |
| Testing    | Jest + Supertest (backend, TDD)                                 |
| Frontend   | React 19, React Router, Tailwind CSS, Vite                      |

## Project structure

```
car-dealership/
├── backend/
│   ├── src/
│   │   ├── controllers/   # authController, vehicleController
│   │   ├── middleware/    # JWT authenticate + requireAdmin
│   │   ├── models/        # db.js (SQLite), userModel, vehicleModel
│   │   ├── routes/        # authRoutes, vehicleRoutes
│   │   ├── app.js         # Express app (routes, error handling)
│   │   └── server.js      # entrypoint
│   ├── tests/              # Jest + Supertest specs (auth, vehicles)
│   └── data/               # SQLite database files (gitignored)
├── frontend/
│   └── src/
│       ├── api/            # fetch client wrapping the backend API
│       ├── context/        # AuthContext (JWT + user, localStorage-backed)
│       ├── components/     # Navbar, VehicleCard, SearchFilters, etc.
│       └── pages/          # Login, Register, Dashboard
├── TEST_REPORT.txt         # Output of the last `npm test` run (backend)
├── PROMPTS.md               # Raw AI chat log for this project
└── README.md                 # You are here
```

## Setup and running locally

Requires **Node.js 18+**.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # edit JWT_SECRET if you like
npm test                # optional: run the test suite first
npm start                # starts the API on http://localhost:4000
```

The SQLite database file is created automatically at
`backend/data/dealership.sqlite3` on first run — no separate database
server to install or configure.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env    # VITE_API_URL defaults to http://localhost:4000/api
npm run dev               # starts the SPA on http://localhost:5173
```

Open `http://localhost:5173`, register an account (choose "Admin" as the
account type to get inventory-management controls), and start adding
vehicles.

### 3. Production build (frontend)

```bash
cd frontend
npm run build     # outputs static files to frontend/dist
npm run preview   # serve the production build locally
```

## API reference

All `/api/vehicles*` routes require `Authorization: Bearer <token>`.
Routes marked **(admin)** additionally require the logged-in user's role
to be `admin`.

| Method | Path                          | Description                              |
|--------|-------------------------------|-------------------------------------------|
| POST   | `/api/auth/register`          | Create an account, returns `{ user, token }` |
| POST   | `/api/auth/login`             | Log in, returns `{ user, token }`         |
| GET    | `/api/vehicles`               | List all vehicles                         |
| GET    | `/api/vehicles/search`        | Filter by `make`, `model`, `category`, `minPrice`, `maxPrice` |
| POST   | `/api/vehicles`               | Create a vehicle                          |
| PUT    | `/api/vehicles/:id`           | Update a vehicle (partial updates allowed)|
| DELETE | `/api/vehicles/:id`           | Delete a vehicle **(admin)**              |
| POST   | `/api/vehicles/:id/purchase`  | Decrease quantity by `{ amount }` (default 1) |
| POST   | `/api/vehicles/:id/restock`   | Increase quantity by `{ amount }` (default 1) **(admin)** |

## Testing

The backend was built test-first. From `backend/`:

```bash
npm test
```

Current results (also saved in [`TEST_REPORT.txt`](TEST_REPORT.txt) at the
repo root):

```
Test Suites: 2 passed, 2 total
Tests:       24 passed, 24 total

File                   | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files               |   89.86 |    83.33 |    86.2 |   93.45
```

## Screenshots

The screenshots below were captured from the running Vite application.

### Login

![Ironclad Motors login screen](docs/screenshots/login.png)

### Registration

![Ironclad Motors registration screen](docs/screenshots/register.png)

## My AI Usage

**Which AI tools I used:** Claude (Anthropic), used directly in an
agentic coding session — it read the kata brief, then wrote the backend,
frontend, tests, and this documentation, executing and verifying its own
work (running the test suite, booting both servers, and hitting the API
with `curl`) along the way.

**How I used it:**

- Handed Claude the kata brief as-is and asked for a full build using the
  specified stack (Node/Express + a real database, React + Tailwind), with
  TDD, AI co-author trailers, and this README structure as explicit
  requirements from the brief itself.
- Claude planned the data model (users/vehicles tables), then worked in a
  genuine Red → Green → Refactor loop for the two backend feature areas
  (auth, then vehicle inventory): writing failing Jest/Supertest specs
  first, confirming they failed for the right reason, then implementing
  just enough code to pass them, running the suite again to confirm green.
- For the frontend, Claude scaffolded a Vite + React + Tailwind app and
  built it top-down: API client → auth context → shared components →
  pages → routing, checking `npm run build` after each layer.
- I asked it to design a distinctive visual identity rather than a
  generic dashboard template — it landed on a dealership/showroom theme
  (asphalt background, headlight-amber and taillight-red accents, a
  license-plate-styled stock counter as the one recurring signature
  element) instead of a default admin-panel look.
- Every commit that used AI-generated or AI-assisted code has a
  `Co-authored-by: Claude <noreply@anthropic.com>` trailer, per the kata's
  transparency requirement. The raw chat transcript backing this build is
  in [`PROMPTS.md`](PROMPTS.md).

**Reflection on how it impacted my workflow:**

Working with an AI assistant end-to-end on a kata like this compresses the
scaffolding and boilerplate stages dramatically — the auth middleware,
the CRUD controller shape, the Tailwind config setup — freeing up
attention for the parts that actually need judgment: what should be
validated and how strictly, where the admin/customer boundary should sit
in the middleware chain, and what a car-dealership SPA should actually
*feel* like rather than defaulting to a generic dashboard. The TDD loop
in particular benefited from having the assistant run the suite after
every change rather than trusting that code "looks right" — it caught a
real bug this way (the `/vehicles/search` route being shadowed by
`/vehicles/:id` when routes were declared in the wrong order), which is
exactly the kind of thing tests-first development is supposed to catch
early. The main thing I stayed responsible for throughout was reviewing
each generated diff against the actual requirement it was meant to
satisfy, rather than accepting code because it ran without errors.
