// Matches "Bearer <token>", "bearer <token>", "BEARER <token>"
const BEARER_REGEX = /^bearer\s+(\S+)$/i;

function extractToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const trimmed = authHeader.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(BEARER_REGEX);
  if (match) {
    return match[1];
  }

  // If explicit scheme is present (e.g. Basic, Digest) or malformed Bearer, reject
  if (/^[a-z]+\s+/i.test(trimmed)) {
    return null;
  }

  // If string is literally "Bearer" with no token, reject
  if (/^bearer$/i.test(trimmed)) {
    return null;
  }

  // Raw token fallback for x-access-token
  return trimmed;
}

module.exports = {
  extractToken,
};
