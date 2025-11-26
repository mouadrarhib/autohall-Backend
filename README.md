# Autohall Backend

Node.js/Express backend for Autohall with MSSQL (Sequelize) and JWT auth. Includes CRUD modules (users, roles, ventes/objectifs, etc.), Swagger documentation, file uploads via Cloudinary, and an AI-assisted objective forecasting endpoint backed by a Python model.

## Stack
- Node.js 18+, Express, Sequelize (MSSQL via `tedious`)
- Auth: JWT (`Authorization: Bearer <token>`) with `isAuth` middleware
- Docs: swagger-jsdoc + swagger-ui at `/docs`
- Storage: Cloudinary (via `multer` / `multer-storage-cloudinary`)
- Python helper: `scripts/predict_objectives.py` (uses `statsmodels` when available)

## Prerequisites
- Node.js 18+
- SQL Server instance reachable via `DB_HOST`/`DB_PORT`
- Python 3.x available on PATH (or set `PYTHON_BIN`); `statsmodels` recommended

## Environment
Create a `.env` with (at minimum):
- `PORT` (default 4000)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` (`DB_PASS`), `DB_HOST` (default localhost), `DB_PORT` (default 1433)
- `JWT_SECRET`, optional `JWT_EXPIRES` (default 1h)
- Cloudinary: `CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- Optional: `PYTHON_BIN` to point to the Python executable for forecasting

## Setup & Run
```bash
npm install
npm run dev    # nodemon app.js
# or
npm start      # node app.js
```
- Health check: `/healthz`
- API base: `/api`
- Swagger UI: `/docs` (JSON at `/docs.json`)

## Prediction endpoint (new)
- **Route**: `POST /api/predictions/objectifs` (JWT required)
- **Body** (either format):
  - Arrays:
    ```json
    { "objectives": [100,120,130], "sales": [90,110,115] }
    ```
  - Month/year entries (sorted server-side):
    ```json
    {
      "months": [
        { "year": 2024, "month": 1, "objective": 3, "sales": 2 },
        { "year": 2024, "month": 2, "objective": 4, "sales": 3 },
        { "year": 2024, "month": 3, "objective": 5, "sales": 4 }
      ]
    }
    ```
- **Response**:
  ```json
  {
    "predictions": [6,7,8],
    "timeline": [
      { "year": 2024, "month": 4, "prediction": 6 },
      { "year": 2024, "month": 5, "prediction": 7 },
      { "year": 2024, "month": 6, "prediction": 8 }
    ]
  }
  ```
- Validation: arrays must match length (>=3), numbers only; 400 on validation failure, 500 on script errors. Controller streams payload to Python via STDIN and accepts both bare array and `{ predictions: [...] }` script outputs.

## Forecasting script (`scripts/predict_objectives.py`)
- Input: JSON via STDIN or CLI args. Supports `months` array or legacy `objectives`/`sales`.
- Output: JSON with `predictions` and optional `timeline`.
- Model:
  - Uses recent sales trend (default last 24 points) to project future sales.
  - Forecasts objectives with SARIMAX (1,1,1) using sales as exogenous; falls back to regression if needed.
  - Applies a conservative scaling factor based on avg sales/objective ratio (clamped).
  - Rounds to integers.
- CLI examples:
  ```bash
  python scripts/predict_objectives.py --months "[{\"year\":2024,\"month\":1,\"objective\":3,\"sales\":2},{\"year\":2024,\"month\":2,\"objective\":4,\"sales\":3},{\"year\":2024,\"month\":3,\"objective\":5,\"sales\":4}]"
  echo '{ "objectives": [100,120,130], "sales": [90,110,115] }' | python scripts/predict_objectives.py
  ```
- Environment: uses `PYTHON_BIN` if set, otherwise `python`; requires `statsmodels` for SARIMAX (falls back to regression if missing).

## Backtesting utility
- Function: `backtest_predict_objectives(months, horizon=3, recent_months=24, baseline_window=6)`
- Behavior:
  - Rolls through historical cutoffs, trains on history, predicts next `horizon`, compares to actuals.
  - Returns MAE/MAPE for the model and a simple baseline (mean of last K objectives), plus per-cutoff details.
  - If not enough data: returns empty metrics with `n_tests: 0`.
- CLI:
  ```bash
  echo '{ "months": [ ... ] }' | python scripts/predict_objectives.py --backtest
  ```

## Other API notes
- Main API modules mounted under `/api` (see `src/routes/index.js` for resources: auth, permissions/roles, ventes, objectifs, etc.).
- Swagger annotations live alongside controllers/routes.
- File uploads use Cloudinary; ensure Cloudinary env vars are set.
- Error handling: centralized handlers; 404 fallback and audit middleware under `/api`.

## Project structure (high level)
```
app.js                   # Express app bootstrap (helmet, cors, swagger, routes)
src/
  config/                # DB and swagger configs
  controllers/           # Route handlers (auth, ventes, objectifs, prediction, etc.)
  routes/                # Express routers mounted under /api
  middlewares/           # Authz/validation/audit/error helpers
  models/                # Sequelize models and init
  helpers/               # JWT, error helpers
  storage/               # Cloudinary setup
scripts/
  predict_objectives.py  # Forecasting + backtesting
```

## Running tests
```bash
npm test   # runs database test (adjust DB config in .env)
```

## Auth and security
- All business endpoints require JWT via `Authorization: Bearer <token>`.
- CORS is enabled for the frontend origin (see `app.js`), adjust as needed.
- Helmet is enabled by default.

## Database
- MSSQL via Sequelize (`tedious` driver).
- Connection settings from `.env` (DB_NAME, DB_USER, DB_PASSWORD/DB_PASS, DB_HOST, DB_PORT).
- Pool tuned to `max:10` `idle:10000` `acquire:30000` (see `src/config/database.js`).

## Cloudinary uploads
- Configure `CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`.
- `multer` + `multer-storage-cloudinary` handle incoming files; see `src/storage/*`.

## Forecasting tips
- Adjust `recent_months` to make the sales trend more or less reactive (default 24).
- `horizon` defaults to 3 but the Python function accepts a custom horizon.
- Backtesting baseline uses the mean of the last `baseline_window` objectives (default 6); tune to compare model vs naive.
