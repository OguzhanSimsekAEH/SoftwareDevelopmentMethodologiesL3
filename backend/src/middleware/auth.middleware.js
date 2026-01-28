import jwt from "jsonwebtoken";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("Authentication required.");
    err.status = 401;
    throw err;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role, email }
    next();
  } catch {
    const err = new Error("Invalid or expired token.");
    err.status = 401;
    throw err;
  }
}
