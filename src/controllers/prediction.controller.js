// src/controllers/prediction.controller.js

import path from 'path';
import { execFile } from 'child_process';
import { AppError } from '../middlewares/responseHandler.js';

const scriptPath = path.resolve(process.cwd(), 'scripts', 'predict_objectives.py');
const pythonExecutable = process.env.PYTHON_BIN || 'python';

/**
 * @openapi
 * tags:
 *   - name: Predictions
 *     description: Forecast upcoming monthly objectives using historical objectives and sales
 */
/**
 * @openapi
 * /api/predictions/objectifs:
 *   post:
 *     summary: Forecast the next three monthly objectives
 *     tags: [Predictions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [objectives, sales]
 *                 properties:
 *                   objectives:
 *                     type: array
 *                     items: { type: number }
 *                     example: [100, 120, 130, 140, 150, 160]
 *                   sales:
 *                     type: array
 *                     items: { type: number }
 *                     example: [90, 110, 115, 130, 140, 155]
 *               - type: object
 *                 required: [months]
 *                 properties:
 *                   months:
 *                     type: array
 *                     description: Monthly data points (will be sorted by year then month)
 *                     items:
 *                       type: object
 *                       required: [year, month, objective, sales]
 *                       properties:
 *                         year: { type: integer, example: 2025 }
 *                         month: { type: integer, minimum: 1, maximum: 12, example: 10 }
 *                         objective: { type: number, example: 140 }
 *                         sales: { type: number, example: 155 }
 *     responses:
 *       200:
 *         description: Predicted objectives for the next three months
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predictions:
 *                   type: array
 *                   items: { type: number }
 *                   example: [170.5, 180.2, 190.1]
 *                 timeline:
 *                   type: array
 *                   description: Predictions aligned to future months (returned when month/year provided)
 *                   items:
 *                     type: object
 *                     properties:
 *                       year: { type: integer, example: 2026 }
 *                       month: { type: integer, minimum: 1, maximum: 12, example: 1 }
 *                       prediction: { type: number, example: 170.5 }
 *       400:
 *         description: Invalid input arrays
 *       500:
 *         description: Prediction failed
 */
const runPredictionScript = (objectives, sales) =>
  new Promise((resolve, reject) => {
    const child = execFile(
      pythonExecutable,
      [scriptPath],
      { timeout: 20000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          const messageParts = [
            error.message,
            stderr ? stderr.toString().trim() : '',
            stdout ? stdout.toString().trim() : ''
          ].filter(Boolean);
          const message = messageParts.join(' | ');
          return reject(new Error(message));
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          const preds = Array.isArray(parsed) ? parsed : parsed?.predictions;
          if (!Array.isArray(preds) || preds.length === 0) {
            return reject(new Error('Prediction output is invalid.'));
          }
          return resolve(preds);
        } catch (parseErr) {
          return reject(new Error('Failed to parse prediction output.'));
        }
      }
    );

    // Send payload via STDIN to avoid any command-line parsing/length issues.
    child.stdin.write(JSON.stringify({ objectives, sales }));
    child.stdin.end();
  });

const validatePayload = (objectives, sales) => {
  if (!Array.isArray(objectives) || !Array.isArray(sales)) {
    throw new AppError('objectives and sales must be arrays.', 400);
  }

  if (objectives.length !== sales.length) {
    throw new AppError('objectives and sales arrays must be the same length.', 400);
  }

  if (objectives.length < 3) {
    throw new AppError('At least 3 months of data are required.', 400);
  }

  const invalidValue = [...objectives, ...sales].some(
    (value) => typeof value !== 'number' || Number.isNaN(value)
  );
  if (invalidValue) {
    throw new AppError('objectives and sales must contain only numbers.', 400);
  }
};

const normalizePayload = (body) => {
  const { objectives, sales, months, entries } = body || {};

  const isNumberArray = (arr) =>
    Array.isArray(arr) && arr.every((v) => typeof v === 'number' && !Number.isNaN(v));

  if (isNumberArray(objectives) && isNumberArray(sales)) {
    return { objectives, sales, lastYear: null, lastMonth: null };
  }

  const points = Array.isArray(months) ? months : Array.isArray(entries) ? entries : null;

  if (points) {
    const sorted = [...points].sort((a, b) =>
      a.year === b.year ? a.month - b.month : a.year - b.year
    );

    const valid = sorted.every(
      (p) =>
        p &&
        Number.isInteger(p.year) &&
        Number.isInteger(p.month) &&
        p.month >= 1 &&
        p.month <= 12 &&
        typeof p.objective === 'number' &&
        !Number.isNaN(p.objective) &&
        typeof p.sales === 'number' &&
        !Number.isNaN(p.sales)
    );

    if (!valid) {
      throw new AppError(
        'months entries must include year, month (1-12), objective, and sales numbers.',
        400
      );
    }

    const objectivesArr = sorted.map((p) => p.objective);
    const salesArr = sorted.map((p) => p.sales);
    const last = sorted[sorted.length - 1];
    return {
      objectives: objectivesArr,
      sales: salesArr,
      lastYear: last.year,
      lastMonth: last.month
    };
  }

  throw new AppError(
    'Provide either numeric arrays objectives/sales or a months array of {year, month, objective, sales}.',
    400
  );
};

const buildTimeline = (predictions, lastYear, lastMonth) => {
  if (!lastYear || !lastMonth) return null;

  let year = lastYear;
  let month = lastMonth;

  return predictions.map((prediction) => {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    return { year, month, prediction };
  });
};

export const predictObjectives = async (req, res, next) => {
  let objectives;
  let sales;
  let lastYear;
  let lastMonth;

  try {
    ({ objectives, sales, lastYear, lastMonth } = normalizePayload(req.body));
    validatePayload(objectives, sales);
    const predictions = await runPredictionScript(objectives, sales);
    const timeline = buildTimeline(predictions, lastYear, lastMonth);
    return res.json({ predictions, ...(timeline && { timeline }) });
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    return next(new AppError(err.message || 'Prediction failed', 500, false));
  }
};
