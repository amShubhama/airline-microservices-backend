const express = require('express');
const { PORT, DB_SYNC } = require('./config/server-config');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/index');
const db = require('./models/index');
const { Queue } = require('./config/index');
const CRON = require('./utils/common/cron-jobs');
const app = express();



const setupAndStartServer = async () => {

    //middlewares
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    await Queue.connectQueue();
    CRON();

    //API's for health-check
    app.get('/', (req, res) => {
        res.send('Server is working');
    })

    //API's Routes
    app.use('/api', apiRoutes);

    app.listen(PORT, () => {
        console.log(`Server start on PORT ${PORT}`);

        if (DB_SYNC) {
            console.log(DB_SYNC);
            db.sequelize.sync({ alter: true });
        }
    })
}

setupAndStartServer();