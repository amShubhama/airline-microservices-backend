const { z } = require('zod');
const { MESSAGES } = require('../constants');

const signupSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: MESSAGES.VALIDATION.EMAIL_REQUIRED })
            .trim()
            .toLowerCase()
            .email({ message: MESSAGES.VALIDATION.INVALID_EMAIL }),
        password: z
            .string({ required_error: MESSAGES.VALIDATION.PASSWORD_REQUIRED })
            .min(6, { message: MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH })
            .max(100, { message: MESSAGES.VALIDATION.PASSWORD_MAX_LENGTH }),
    }),
});

const signinSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: MESSAGES.VALIDATION.EMAIL_REQUIRED })
            .trim()
            .toLowerCase()
            .email({ message: MESSAGES.VALIDATION.INVALID_EMAIL }),
        password: z
            .string({ required_error: MESSAGES.VALIDATION.PASSWORD_REQUIRED })
            .min(1, { message: MESSAGES.VALIDATION.PASSWORD_REQUIRED }),
    }),
});

module.exports = {
    signupSchema,
    signinSchema,
};
