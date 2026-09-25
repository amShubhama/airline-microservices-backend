const { extractToken } = require('../../../src/utils/helpers/token-helper');

describe('token-helper utility', () => {
  describe('extractToken', () => {
    it('should return null when auth header is missing or not a string', () => {
      expect(extractToken(null)).toBeNull();
      expect(extractToken(undefined)).toBeNull();
      expect(extractToken(12345)).toBeNull();
      expect(extractToken({})).toBeNull();
      expect(extractToken('')).toBeNull();
      expect(extractToken('   ')).toBeNull();
    });

    it('should correctly extract token with standard "Bearer <token>"', () => {
      const token = 'xyz.abc.123';
      expect(extractToken(`Bearer ${token}`)).toBe(token);
    });

    it('should be case-insensitive to "bearer" prefix', () => {
      const token = 'xyz.abc.123';
      expect(extractToken(`bearer ${token}`)).toBe(token);
      expect(extractToken(`BEARER ${token}`)).toBe(token);
      expect(extractToken(`bEaReR ${token}`)).toBe(token);
    });

    it('should return null if the value is just "Bearer" without a token', () => {
      expect(extractToken('Bearer')).toBeNull();
      expect(extractToken('bearer')).toBeNull();
      expect(extractToken('BEARER ')).toBeNull();
    });

    it('should reject alternative schemes like Basic or Digest', () => {
      expect(extractToken('Basic dXNlcjpwYXNz')).toBeNull();
      expect(extractToken('Digest some-digest-hash')).toBeNull();
    });

    it('should fall back to raw token if no scheme is provided (for x-access-token header)', () => {
      const rawToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      expect(extractToken(rawToken)).toBe(rawToken);
      expect(extractToken(`  ${rawToken}  `)).toBe(rawToken);
    });
  });
});
