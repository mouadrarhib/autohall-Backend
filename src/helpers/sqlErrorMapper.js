export function mapSqlError(err) {
  // Make sure we have a message string to inspect
  const raw = err && (err.message ?? err.msqlMessage ?? err.sqlMessage ?? err.toString());
  const message = typeof raw === 'string' ? raw : JSON.stringify(raw);

  // default status
  let status = 500;
  let userMessage = 'Internal server error';

  // Example checks (adjust to your DB errors)
  if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('duplicate')) {
    status = 409;
    userMessage = 'Resource already exists';
  } else if (message.toLowerCase().includes('not null') || message.toLowerCase().includes('cannot be null')) {
    status = 400;
    userMessage = 'Missing required fields';
  } else if (message.toLowerCase().includes('foreign key')) {
    status = 400;
    userMessage = 'Invalid foreign key reference';
  } else {
    // fallback: return original message but keep it safe
    userMessage = message;
  }

  return { status, message: userMessage };
}
