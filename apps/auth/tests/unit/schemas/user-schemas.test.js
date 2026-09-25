const { signupSchema, signinSchema } = require('../../../src/schemas/index');

describe('User Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should pass on valid email and password', async () => {
      const valid = {
        body: {
          email: 'newUser@airline.com',
          password: 'SecurePassword123',
        },
      };

      const result = await signupSchema.parseAsync(valid);

      expect(result.body.email).toBe('newuser@airline.com');
      expect(result.body.password).toBe('SecurePassword123');
    });

    it('should fail if email is missing', async () => {
      const payload = { body: { password: 'SecurePassword123' } };
      await expect(signupSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should fail if email format is invalid', async () => {
      const invalidEmails = ['invalid', 'plainaddress', '@missingusername.com', 'user@.com'];
      for (const email of invalidEmails) {
        await expect(signupSchema.parseAsync({ body: { email, password: 'Password123' } })).rejects.toThrow();
      }
    });

    it('should fail if password is shorter than 6 characters', async () => {
      const payload = { body: { email: 'test@airline.com', password: '12345' } };
      await expect(signupSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should fail if password is longer than 100 characters', async () => {
      const payload = { body: { email: 'test@airline.com', password: 'a'.repeat(101) } };
      await expect(signupSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should trim and lowercase the email', async () => {
      const payload = { body: { email: '  CAPS_USER@AIRLINE.COM  ', password: 'Password123' } };
      const result = await signupSchema.parseAsync(payload);
      expect(result.body.email).toBe('caps_user@airline.com');
    });
  });

  describe('signinSchema', () => {
    it('should pass on valid email and non-empty password', async () => {
      const valid = {
        body: {
          email: 'LOGIN@AIRLINE.COM',
          password: 'p',
        },
      };

      const result = await signinSchema.parseAsync(valid);

      expect(result.body.email).toBe('login@airline.com');
      expect(result.body.password).toBe('p');
    });

    it('should fail if password is an empty string', async () => {
      const payload = { body: { email: 'test@airline.com', password: '' } };
      await expect(signinSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should fail if email is missing', async () => {
      const payload = { body: { password: 'Password123' } };
      await expect(signinSchema.parseAsync(payload)).rejects.toThrow();
    });
  });
});
