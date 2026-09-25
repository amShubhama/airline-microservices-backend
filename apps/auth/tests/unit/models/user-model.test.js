const bcrypt = require('bcrypt');
const { User, Role } = require('../../../src/models/index');

describe('User Model', () => {
  describe('toJSON', () => {
    it('should strip password from JSON representation', () => {
      const userInstance = User.build({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@airline.com',
        password: 'SecretPassword123',
      });

      const json = userInstance.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.email).toBe('test@airline.com');
      expect(json.id).toBeDefined();
    });
  });

  describe('beforeCreate hook', () => {
    it('should hash plain text password before creating a user', async () => {
      const userInstance = User.build({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'hooktest@airline.com',
        password: 'PlainPassword123',
      });

      await User.runHooks('beforeCreate', userInstance);

      expect(userInstance.password).not.toBe('PlainPassword123');
      const isMatch = await bcrypt.compare('PlainPassword123', userInstance.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('associate', () => {
    it('should define belongsToMany association with Role model', () => {
      const belongsToManySpy = jest.spyOn(User, 'belongsToMany').mockImplementation(() => {});

      User.associate({ Role });

      expect(belongsToManySpy).toHaveBeenCalledWith(
        Role,
        expect.objectContaining({
          through: 'User_Roles',
          foreignKey: 'UserId',
          otherKey: 'RoleId',
        }),
      );

      belongsToManySpy.mockRestore();
    });
  });
});
