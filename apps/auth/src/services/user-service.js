const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');

const UserRepository = require('../repositories/user-repository');
const { JWT_KEY, JWT_EXPIRY } = require('../config/server-config');
const AppError = require('../utils/errors/app-error');
const { MESSAGES } = require('../constants');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data) {
    return await this.userRepository.create(data);
  }

  async signIn(email, plainPassword) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await this.userRepository.getByEmail(normalizedEmail, true);

    if (!user) {
      throw new AppError(
        MESSAGES.AUTH.INVALID_CREDENTIALS,
        StatusCodes.UNAUTHORIZED,
        MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    }

    const isPasswordMatch = await this.#checkPassword(plainPassword, user.password);

    if (!isPasswordMatch) {
      throw new AppError(
        MESSAGES.AUTH.INVALID_CREDENTIALS,
        StatusCodes.UNAUTHORIZED,
        MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    }

    const roles = user.Roles ? user.Roles.map((r) => r.role) : [];

    const token = this.#createToken({
      id: user.id,
      email: user.email,
      roles,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        Roles: user.Roles || [],
      },
    };
  }

  async isAuthenticated(token) {
    if (!token) {
      throw new AppError(MESSAGES.AUTH.TOKEN_MISSING, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_MISSING);
    }

    const decoded = this.#verifyToken(token);

    const user = await this.userRepository.getById(decoded.id);

    if (!user) {
      throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.USER_NOT_FOUND);
    }

    return user;
  }

  async isAdmin(token) {
    if (!token) {
      throw new AppError(MESSAGES.AUTH.TOKEN_MISSING, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_MISSING);
    }

    const decoded = this.#verifyToken(token);

    if (!decoded || !decoded.id) {
      throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_INVALID);
    }

    // Ensure user still exists in the database
    const adminStatus = await this.userRepository.checkAdminStatus(decoded.id);
    if (!adminStatus.userExists) {
      throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.USER_NOT_FOUND);
    }

    return adminStatus.isAdmin;
  }

  #createToken(payload) {
    return jwt.sign(payload, JWT_KEY, { expiresIn: JWT_EXPIRY || '1d' });
  }

  #verifyToken(token) {
    try {
      return jwt.verify(token, JWT_KEY);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(MESSAGES.AUTH.TOKEN_EXPIRED, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_EXPIRED);
      }
      throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  async #checkPassword(userInputPlainPassword, encryptedPassword) {
    if (!userInputPlainPassword || !encryptedPassword) {
      return false;
    }
    return await bcrypt.compare(userInputPlainPassword, encryptedPassword);
  }
}

module.exports = UserService;
