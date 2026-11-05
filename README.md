# Student Grade Predictor

Full-stack app: React frontend, Express + Prisma (PostgreSQL) backend,
calling a separate FastAPI ML microservice for predictions.

## Backend setup

Uses SQLite — no separate database server needed, it's just a file (dev.db).

```
cd backend
npm install
cp .env.example .env      # DATABASE_URL="file:./dev.db" by default, fill in JWT_SECRET, ML_SERVICE_URL
npx prisma migrate dev --name init
npm run dev
```

Runs on http://localhost:3001

### Routes
- POST /register/        { name, email, password }
- POST /login/           { email, password } -> { jwtToken, name }
- POST /predict/         (auth) { studyHours, homeCondition, parentalPressure }
- POST /predict/bulk/    (auth) multipart form-data, field name "csvFile"
- GET  /history/         (auth)

CSV columns expected for bulk upload: studyHours, homeCondition, parentalPressure

## Frontend setup

```
cd frontend
npm install
cp .env.example .env      # set REACT_APP_API_BASE_URL
npm start
```

Runs on http://localhost:3000

## Notes
- The ML microservice (FastAPI) is expected to expose a POST endpoint that
  accepts { studyHours, homeCondition, parentalPressure } and returns
  { score }. Point ML_SERVICE_URL in backend/.env to it.
- JWT is stored client-side via js-cookie (jwt_token) and sent as an
  Authorization: Bearer header, matching your existing auth pattern.
- This is scaffolded and untested against a live DB/ML service — run
  `npx prisma migrate dev` and test each route once your Postgres and
  FastAPI service are up.
