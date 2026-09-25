const { StatusCodes } = require('http-status-codes');
const { User, Role, sequelize } = require('../models/index');
const AppError = require('../utils/errors/app-error');
const { MESSAGES } = require('../constants');

class UserRepository {
    async create(data, defaultRoleName = 'CUSTOMER') {
        const transaction = await sequelize.transaction();
        try {
            const defaultRole = await Role.findOne({
                where: { role: defaultRoleName },
                transaction,
            });

            if (!defaultRole) {
                throw new AppError(
                    MESSAGES.AUTH.DEFAULT_ROLE_NOT_FOUND,
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    `Default role '${defaultRoleName}' does not exist in the database. Ensure seeders are run.`
                );
            }

            const user = await User.create(data, { transaction });
            await user.addRole(defaultRole, { transaction });

            await transaction.commit();

            const userJson = user.toJSON();
            userJson.Roles = [{ id: defaultRole.id, role: defaultRole.role }];
            return userJson;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async destroy(userId) {
        const deletedRows = await User.destroy({
            where: { id: userId },
        });
        return deletedRows > 0;
    }

    async getById(userId) {
        return await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    attributes: ['id', 'role'],
                    through: { attributes: [] },
                },
            ],
        });
    }

    async getByEmail(userEmail, includePassword = false) {
        const model = includePassword ? User.scope('withPassword') : User;
        return await model.findOne({
            where: { email: userEmail },
            include: [
                {
                    model: Role,
                    attributes: ['id', 'role'],
                    through: { attributes: [] },
                },
            ],
        });
    }

    async checkAdminStatus(userId) {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    attributes: ['id', 'role'],
                    through: { attributes: [] },
                },
            ],
        });

        if (!user) {
            return { userExists: false, isAdmin: false, roles: [] };
        }

        const roles = (user.Roles || []).map((r) => r.role);
        const isAdmin = roles.includes('ADMIN');

        return {
            userExists: true,
            isAdmin,
            roles,
        };
    }
}

module.exports = UserRepository;