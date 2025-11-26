"""
Predict the next three monthly objectives using historical objectives and sales.

Input (CLI/STDIN): JSON with either:
- {"months": [{"year": ..., "month": ..., "objective": ..., "sales": ...}, ...]}
- Or legacy: {"objectives": [...], "sales": [...]}

Output (CLI): {"predictions": [int, int, int], "timeline": [{year, month, prediction}, ...]}

This script also exposes a backtesting helper to evaluate the forecasting pipeline.
"""

from __future__ import annotations

import argparse
import json
import sys
import warnings
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np

try:
    from statsmodels.tsa.statespace.sarimax import SARIMAX
except ModuleNotFoundError:  # statsmodels not installed
    SARIMAX = None


@dataclass
class PreparedSeries:
    objectives: List[float]
    sales: List[float]
    last_year: Optional[int]
    last_month: Optional[int]


def _prepare_series(data: Dict) -> PreparedSeries:
    """Extract and validate objectives/sales arrays from input data."""
    months = data.get("months") or data.get("entries")
    objectives = data.get("objectives")
    sales = data.get("sales")

    if months:
        if not isinstance(months, list):
            raise ValueError("months must be a list of {year, month, objective, sales}.")

        sorted_months = sorted(
            months,
            key=lambda m: (m.get("year"), m.get("month"))
        )

        def _valid(m):
            return (
                isinstance(m, dict)
                and isinstance(m.get("year"), int)
                and isinstance(m.get("month"), int)
                and 1 <= m.get("month") <= 12
                and isinstance(m.get("objective"), (int, float))
                and isinstance(m.get("sales"), (int, float))
            )

        if not all(_valid(m) for m in sorted_months):
            raise ValueError(
                "Each month must include integer year, month (1-12), and numeric objective/sales."
            )

        objectives = [float(m["objective"]) for m in sorted_months]
        sales = [float(m["sales"]) for m in sorted_months]
        last_year = sorted_months[-1]["year"]
        last_month = sorted_months[-1]["month"]
        return PreparedSeries(objectives, sales, last_year, last_month)

    if objectives is None or sales is None:
        raise ValueError("Provide either months array or objectives and sales arrays.")

    if not isinstance(objectives, list) or not isinstance(sales, list):
        raise ValueError("objectives and sales must be lists.")

    objectives_f = []
    sales_f = []
    try:
        objectives_f = [float(x) for x in objectives]
        sales_f = [float(x) for x in sales]
    except (TypeError, ValueError) as exc:
        raise ValueError("objectives and sales must be numeric lists.") from exc

    if len(objectives_f) != len(sales_f):
        raise ValueError("objectives and sales must have the same length.")

    return PreparedSeries(objectives_f, sales_f, None, None)


def _forecast_future_sales(
    sales: Sequence[float],
    horizon: int,
    recent_months: int = 24
) -> np.ndarray:
    """Project future sales using a linear trend on the most recent data."""
    if len(sales) < 2:
        raise ValueError("At least 2 sales points are required to forecast future sales.")

    window = sales[-recent_months:] if len(sales) > recent_months else sales
    x = np.arange(len(window))
    slope, intercept = np.polyfit(x, window, 1)
    future_x = np.arange(len(window), len(window) + horizon)
    future_sales = intercept + slope * future_x
    return np.clip(future_sales, a_min=0, a_max=None)


def _predict_objectives_from_sales(
    objectives: Sequence[float],
    sales: Sequence[float],
    horizon: int,
    recent_months: int
) -> List[float]:
    """Forecast objectives given historical objectives and sales."""
    endog = np.asarray(objectives, dtype=float)
    exog = np.asarray(sales, dtype=float)

    if len(endog) < 2 or len(exog) < 2:
        raise ValueError("At least 2 data points are required to forecast objectives.")

    future_exog = _forecast_future_sales(exog, horizon=horizon, recent_months=recent_months)

    warnings.filterwarnings("ignore")

    preds: Optional[np.ndarray] = None
    if SARIMAX is not None:
        try:
            model = SARIMAX(
                endog,
                exog=exog,
                order=(1, 1, 1),
                enforce_stationarity=False,
                enforce_invertibility=False,
            )
            fit = model.fit(disp=False)
            prediction = fit.get_forecast(steps=horizon, exog=future_exog)
            preds = prediction.predicted_mean
        except Exception:
            preds = None

    if preds is None:
        # Fallback: linear regression of objectives on sales.
        if len(exog) < 2:
            raise ValueError("Not enough data to fit fallback regression.")
        slope, intercept = np.polyfit(exog, endog, 1)
        preds = intercept + slope * future_exog

    preds = np.maximum(preds, 0.0)
    return preds.tolist()


def _apply_scaling_factor(
    predictions: Sequence[float],
    objectives: Sequence[float],
    sales: Sequence[float]
) -> List[float]:
    """
    Apply a small scaling based on average sales/objective ratio.
    Keeps adjustments conservative.
    """
    avg_obj = float(np.mean(objectives)) if len(objectives) else 0.0
    avg_sales = float(np.mean(sales)) if len(sales) else 0.0
    if avg_obj > 0:
        ratio = avg_sales / avg_obj
        multiplier = 1 + 0.2 * (ratio - 1)
        multiplier = min(max(multiplier, 0.9), 1.15)
        return [float(x * multiplier) for x in predictions]
    return list(predictions)


def _build_timeline(
    predictions: Sequence[float],
    last_year: Optional[int],
    last_month: Optional[int]
) -> Optional[List[Dict[str, int]]]:
    """Attach future year/month to predictions when last date is known."""
    if last_year is None or last_month is None:
        return None

    year = last_year
    month = last_month
    timeline = []
    for pred in predictions:
        month += 1
        if month > 12:
            month = 1
            year += 1
        timeline.append({"year": year, "month": month, "prediction": int(round(pred))})
    return timeline


def predict_objectives(
    data: Dict,
    horizon: int = 3,
    recent_months: int = 24
) -> Dict[str, object]:
    """
    Predict the next `horizon` objectives from historical months or arrays.

    Returns:
      {
        "predictions": [int, ...],
        "timeline": [{"year", "month", "prediction"}, ...] or None
      }
    """
    series = _prepare_series(data)

    preds = _predict_objectives_from_sales(
        series.objectives,
        series.sales,
        horizon=horizon,
        recent_months=recent_months,
    )

    scaled = _apply_scaling_factor(preds, series.objectives, series.sales)
    rounded = [int(round(x)) for x in scaled]
    timeline = _build_timeline(rounded, series.last_year, series.last_month)

    response = {"predictions": rounded}
    if timeline:
        response["timeline"] = timeline
    return response


def _compute_mae(errors: List[float]) -> Optional[float]:
    return float(np.mean(np.abs(errors))) if errors else None


def _compute_mape(actuals: List[float], preds: List[float]) -> Optional[float]:
    perc_errors = []
    for a, p in zip(actuals, preds):
        if a == 0:
            continue
        perc_errors.append(abs(a - p) / abs(a))
    if not perc_errors:
        return None
    return float(np.mean(perc_errors) * 100.0)


def backtest_predict_objectives(
    months: List[Dict],
    horizon: int = 3,
    recent_months: int = 24,
    baseline_window: int = 6
) -> Dict[str, object]:
    """
    Evaluate forecasting pipeline on historical data with rolling cutoffs.
    Returns MAE/MAPE for the model and a simple baseline.
    """
    if not months or len(months) < 3:
        return {
            "model_mae": None,
            "model_mape": None,
            "baseline_mae": None,
            "baseline_mape": None,
            "n_tests": 0,
            "details": [],
        }

    sorted_months = sorted(months, key=lambda m: (m.get("year"), m.get("month")))
    n = len(sorted_months)
    details = []

    model_errors = []
    baseline_errors = []
    model_actuals_all = []
    model_preds_all = []
    baseline_actuals_all = []
    baseline_preds_all = []

    for cutoff in range(1, n - horizon + 1):
        train = sorted_months[:cutoff]
        test = sorted_months[cutoff : cutoff + horizon]

        if len(train) < 2:
            continue

        try:
            model_out = predict_objectives(
                {"months": train},
                horizon=horizon,
                recent_months=recent_months,
            )
            preds = model_out["predictions"]
        except Exception:
            continue

        actuals = [float(m["objective"]) for m in test]
        model_actuals_all.extend(actuals)
        model_preds_all.extend(preds)
        errors = [a - p for a, p in zip(actuals, preds)]
        model_errors.extend(errors)

        # Baseline: average of last K objectives.
        k = min(baseline_window, len(train))
        if k == 0:
            continue
        avg_obj = float(np.mean([m["objective"] for m in train[-k:]]))
        baseline_preds = [avg_obj for _ in range(horizon)]
        baseline_actuals_all.extend(actuals)
        baseline_preds_all.extend(baseline_preds)
        b_errors = [a - p for a, p in zip(actuals, baseline_preds)]
        baseline_errors.extend(b_errors)

        details.append(
            {
                "cutoff_year": train[-1]["year"],
                "cutoff_month": train[-1]["month"],
                "predictions": preds,
                "actuals": actuals,
                "errors": errors,
                "baseline_predictions": baseline_preds,
            }
        )

    n_tests = len(details)
    if n_tests == 0:
        return {
            "model_mae": None,
            "model_mape": None,
            "baseline_mae": None,
            "baseline_mape": None,
            "n_tests": 0,
            "details": [],
        }

    return {
        "model_mae": _compute_mae(model_errors),
        "model_mape": _compute_mape(model_actuals_all, model_preds_all),
        "baseline_mae": _compute_mae(baseline_errors),
        "baseline_mape": _compute_mape(baseline_actuals_all, baseline_preds_all),
        "n_tests": n_tests,
        "details": details,
    }


def _cli_predict(payload: Dict):
    result = predict_objectives(payload)
    print(json.dumps(result))


def _parse_cli_input() -> Dict:
    """Parse input from CLI arguments or STDIN JSON."""
    parser = argparse.ArgumentParser(description="Predict next objectives or backtest.")
    parser.add_argument("--objectives", type=str, help="JSON array of objectives")
    parser.add_argument("--sales", type=str, help="JSON array of sales")
    parser.add_argument("--months", type=str, help="JSON array of months objects")
    parser.add_argument(
        "--backtest",
        action="store_true",
        help="Run backtest instead of single prediction",
    )
    args = parser.parse_args()

    data = {}
    if args.months:
        data["months"] = json.loads(args.months)
    elif args.objectives and args.sales:
        data["objectives"] = json.loads(args.objectives)
        data["sales"] = json.loads(args.sales)
    else:
        raw_input = sys.stdin.read().strip()
        if not raw_input:
            raise ValueError("Provide input via --months/--objectives/--sales or STDIN JSON.")
        data = json.loads(raw_input)

    return data, args.backtest


def main():
    try:
        payload, do_backtest = _parse_cli_input()
        if do_backtest:
            months = payload.get("months") or payload.get("entries")
            if not months:
                raise ValueError("Backtest requires a 'months' array.")
            result = backtest_predict_objectives(months)
            print(json.dumps(result))
        else:
            _cli_predict(payload)
    except Exception as exc:  # pylint: disable=broad-except
        sys.stderr.write(str(exc))
        sys.exit(1)


if __name__ == "__main__":
    main()
