const mockUser = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  email: 'test@airline.com',
  Roles: [{ id: 1, role: 'CUSTOMER' }],
};

const mockAdminUser = {
  id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  email: 'admin@airline.com',
  Roles: [{ id: 2, role: 'ADMIN' }],
};

const validSignupPayload = {
  email: 'newuser@airline.com',
  password: 'Password@123',
};

const validSigninPayload = {
  email: 'test@airline.com',
  password: 'Password@123',
};

module.exports = {
  mockUser,
  mockAdminUser,
  validSignupPayload,
  validSigninPayload,
};
