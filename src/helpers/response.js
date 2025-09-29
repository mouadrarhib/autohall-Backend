export function sendError(res, status, msg) {
return res.status(status).json({ error: msg });
}