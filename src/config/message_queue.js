const amqplib = require('amqplib');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME, } = require('./serverConfig');
const { sendConfirmationEmail } = require('../services/email-service');

let channel;

const connectQueue = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
        return channel;
    } catch (error) {
        throw error;
    }
}

const subscribeMessage = async (binding_key) => {
    try {
        const applicationQueue = await channel.assertQueue('REMAINDER_QUEUE');

        channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

        channel.consume(applicationQueue.queue, async (msg) => {
            console.log('received data');
            const data = JSON.parse(msg.content.toString());
            if (data.service === 'New Booking') {
                await sendConfirmationEmail(data);
            }
            channel.ack(msg);
        });

    } catch (error) {
        throw error;
    }
}

module.exports = {
    connectQueue,
    subscribeMessage,
}