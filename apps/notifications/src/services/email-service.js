const sender = require('../config/emailConfig');
const TicketRepository = require('../repositories/ticket-repository');
const { newBookingTemplate } = require('../templates');

const ticketRepository = new TicketRepository();

const createNotification = async (data) => {
    try {
        const response = await ticketRepository.create(data);
        return response;
    } catch (error) {
        throw error;
    }
}

const sendEmail = async (mailFrom, mailTo, subject, content) => {
    try {
        const info = await sender.sendMail({
            from: mailFrom,
            to: mailTo,
            subject,
            html: content
        })
        console.log(info);
    } catch (error) {
        console.log(error);
    }
}

const sendConfirmationEmail = async (bookingData) => {
    try {
        const htmlContent = newBookingTemplate(bookingData);

        await sendEmail(
            'no-reply@flyhigh.com',
            bookingData.bookingDetails.userEmail,
            '🎫 Your Flight Booking is Confirmed ✈️',
            htmlContent
        );

    } catch (error) {
        console.error('Error while sending booking confirmation email:', error);
    }
}

module.exports = {
    createNotification,
    sendConfirmationEmail,
}