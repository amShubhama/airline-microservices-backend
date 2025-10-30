const axios = require('axios');
const { USER_SERVICE } = require('../config/server-config');
const { StatusCodes } = require('http-status-codes');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        if (!token) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: 'Access denied. No token provided.' });
        }

        const response = await axios.get(`${USER_SERVICE}/api/v1/auth/verify`, {
            headers: {
                'x-access-token': token,
            },
        });

        const userData = response.data;

        if (userData && userData.success) {
            console.log(userData.data.id);
            req.body.userId = userData.data.id; // Attach user id for ticket creation
            req.body.userEmail = userData.data.email;
            return next();
        } else {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: 'Invalid or expired token.' });
        }
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: 'Token verification failed.' });
    }
};

module.exports = authenticateUser;