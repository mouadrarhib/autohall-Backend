# Autohall Backend – Prediction Endpoint and Forecasting Script

## New prediction feature
- **Endpoint**: `POST /api/predictions/objectifs`
- **Auth**: protected by `isAuth` (bearer token).
- **Request (two formats)**:
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
- Errors: 400 for invalid input, 500 for script failures. Controller now accepts both bare array output and `{ predictions: [...] }` from the Python script.

## Python forecasting script (`scripts/predict_objectives.py`)
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
  # or
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

## Notes
- The controller streams payload to the script via STDIN (avoids long/quoted args) and handles both array and object script outputs.
- Predictions are always three steps by default but respect `horizon` if provided to the Python function.
