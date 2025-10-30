const express = require('express');
const bodyParser = require('body-parser');
const { PORT, REMAINDER_BINDING_KEY } = require('./config/serverConfig');
const CRON = require('./utils/cron-jobs');
const Queue = require('./config/message_queue');

const setupandStartServer = async () => {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    await Queue.connectQueue();
    Queue.subscribeMessage(REMAINDER_BINDING_KEY);
    CRON();

    //API for health-check
    app.get('/', (req, res) => res.send('Working'));

    app.listen(PORT, () => {
        console.log(`Server start at PORT ${PORT}`);
    })
}

setupandStartServer();