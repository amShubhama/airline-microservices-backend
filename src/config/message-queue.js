const amqplib = require('amqplib');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME, } = require('./server-config');

let channel;

const connectQueue = async () => {
    try {

        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', false);

    } catch (error) {
        throw error;
    }
}

const publishMessage = async (binding_key, payload) => {
    try {
        await channel.assertQueue('REMAINDER_QUEUE');
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(JSON.stringify(payload)));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    connectQueue,
    publishMessage
}