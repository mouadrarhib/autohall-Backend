// src/middlewares/audit.js
import { sequelize } from '../config/database.js';

export function audit(action, moduleName) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        await sequelize.query(
          `INSERT INTO dbo.AuditLog([timestamp], module, objectId, [scope], userId, message, [action], machineIp, description)
           VALUES(SYSUTCDATETIME(), :module, :objectId, :scope, :userId, :message, :action, :ip, :desc)`,
          {
            replacements: {
              module: moduleName,
              objectId: res.locals.objectId || null,
              scope: req.headers['x-scope'] || 'api',
              userId: req.user?.id || null,
              message: `${req.method} ${req.originalUrl} => ${res.statusCode}`,
              action,
              ip: req.ip || '0.0.0.0',
              desc: res.locals.auditDescription || null
            }
          }
        );
      } catch { /* ignore audit failures */ }
    });
    next();
  };
}
