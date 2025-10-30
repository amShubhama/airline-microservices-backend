const TicketService = require('../services/email-service');


const create = async (req, res) => {
    try {
        const response = await TicketService.createNotification(req.body);
        return res.status(201).json({
            data: response,
            success: true,
            err: {},
            message: 'Successfully registered an email remainder'
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            success: false,
            err: error,
            message: 'Failed to register an email remainder'
        });
    }
}

module.exports = {
    create,
}