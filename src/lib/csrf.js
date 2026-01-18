export function getOrCreateCsrfToken(req, res) {
  const existingToken = req.cookies['csrf-token'];
  if (existingToken) return existingToken;

  const { randomUUID } = require('crypto');
  const newToken = randomUUID();

  res.setHeader('Set-Cookie', `csrf-token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return newToken;
}
