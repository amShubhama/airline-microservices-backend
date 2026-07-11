const cron = require('node-cron');
const emailService = require('../services/email-service');
/**
 * 10:00 am
 * Every 5 minutes
 * We will check are there any pending emails which was expected to be sent
 * by now and is pending
 */

function scheduleCrons() {
    cron.schedule('*/5 * * * *', async () => {
        console.log("email sent successfully");
    });
}


module.exports = scheduleCrons;