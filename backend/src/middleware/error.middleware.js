export function errorMiddleware(err, _req, res, _next) {
  console.error(err);

  const status = Number(err.status) || 500;
  const message = err?.message || "Unexpected server error.";

  res.status(status).json({ error: message });
}
