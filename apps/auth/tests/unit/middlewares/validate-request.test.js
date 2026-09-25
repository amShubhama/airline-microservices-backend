const validateRequest = require('../../../src/middlewares/validate-request');
const ValidationError = require('../../../src/utils/errors/validation-error');
const { z } = require('zod');

describe('validateRequest middleware', () => {
  const testSchema = z.object({
    body: z.object({
      email: z.string().email(),
    }),
  });

  it('should call next() without error if payload is valid', async () => {
    const middleware = validateRequest(testSchema);
    const req = {
      body: { email: 'valid@example.com' },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(ValidationError) if validation fails', async () => {
    const middleware = validateRequest(testSchema);
    const req = {
      body: { email: 'invalid-email-format' },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(ValidationError);
    expect(errorArg.statusCode).toBe(400);
    expect(errorArg.explanation.length).toBeGreaterThan(0);
  });

  it('should assign parsed/transformed body, query, and params back to req', async () => {
    const fullSchema = z.object({
      body: z.object({
        email: z.string().trim().toLowerCase(),
      }),
      query: z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
      }),
      params: z.object({
        id: z.string().toUpperCase(),
      }),
    });
    const middleware = validateRequest(fullSchema);
    const req = {
      body: { email: '  TRIMMED@EXAMPLE.COM  ' },
      query: { page: '5' },
      params: { id: 'abc-123' },
    };
    const res = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(req.body.email).toBe('trimmed@example.com');
    expect(req.query.page).toBe(5);
    expect(req.params.id).toBe('ABC-123');
    expect(next).toHaveBeenCalledWith();
  });
});
