// src/middlewares/auditAll.js
import { sequelize } from '../config/database.js';

// Call proc: dbo.usp_AuditLog_Write
const SQL_WRITE = `
  EXEC dbo.usp_AuditLog_Write
    @module=:module,
    @action=:action,
    @objectId=:objectId,
    @scope=:scope,
    @userId=:userId,
    @message=:message,
    @machineIp=:ip,
    @description=:description;
`;

// Map HTTP method + path to a business action
function inferAction(req) {
  const p = req.path.toLowerCase();

  // well-known verbs by path
  if (p.endsWith('/activate'))   return 'ACTIVATE';
  if (p.endsWith('/deactivate')) return 'DEACTIVATE';
  if (p.includes('/login'))      return 'LOGIN';
  if (p.includes('/register'))   return 'REGISTER';

  // generic by method
  switch (req.method) {
    case 'GET':    return 'READ';
    case 'POST':   return 'CREATE';
    case 'PATCH':
    case 'PUT':    return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default:       return req.method;
  }
}

// Derive module from first segment after /api (e.g. /api/modeles/5 => "modeles")
function inferModule(req) {
  const match = req.path.replace(/^\/+/, '').split('/');
  // Usually req.baseUrl = /api, so read after that:
  const base = (req.baseUrl || '').replace(/^\/+/, '').split('/');
  // Try to get first segment beyond /api
  if (base[0] === 'api' && base[1]) return base[1];
  if (match[0] === 'api' && match[1]) return match[1];
  return base[0] || match[0] || 'unknown';
}

// Mask sensitive fields in request body for safety
function maskBody(body) {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  const sensitive = ['password', 'newPassword', 'token', 'authorization'];
  for (const k of sensitive) {
    if (k in clone) clone[k] = '***';
  }
  return clone;
}

// Optional: skip noisy endpoints
const SKIP = [
  '^/healthz$',
  '^/docs($|/)',
  '^/docs.json$',
];
const skipRegex = new RegExp(SKIP.join('|'));

export function auditAll() {
  return (req, res, next) => {
    // Skip health/docs noise
    if (skipRegex.test(req.originalUrl)) return next();

    const started = Date.now();
    const moduleName = inferModule(req);
    const action = inferAction(req);
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';

    // When response finishes, write one log row
    res.on('finish', async () => {
      try {
        const status = res.statusCode;
        const ok = status < 400;
        const userId = req.user?.id ?? null;

        // Prefer a domain object id set by controllers (e.g. res.locals.objectId = newId)
        const objectId = res.locals.objectId ?? null;

        // Build a compact message/description
        const message = `${req.method} ${req.originalUrl} => ${status}`;
        const descObj = {
          query: req.query,
          body: maskBody(req.body),
          tookMs: Date.now() - started,
          ua: req.headers['user-agent'] || null,
        };
        const description = JSON.stringify(descObj);

        await sequelize.query(SQL_WRITE, {
          replacements: {
            module: moduleName,
            action,
            objectId,
            scope: 'api',
            userId: userId ? String(userId) : null,
            message,
            ip,
            description,
          },
          type: sequelize.QueryTypes.SELECT,
        });
      } catch (e) {
        // Never crash the request because auditing failed
        if (process.env.NODE_ENV !== 'production') {
          console.error('auditAll write failed:', e?.original?.message || e.message);
        }
      }
    });

    next();
  };
}
