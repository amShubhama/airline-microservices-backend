const express = require('express');
const bodyParser = require('body-parser');
const { PORT } = require('./config/serverConfig.js');
const apiRoutes = require('./routes/index.js');
const db = require('./models/index.js');
const app = express();

const prepareAndStartServer = () => {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/', (req, res) => res.send("Api's is working!"));
    app.use('/api', apiRoutes);

    app.listen(PORT, () => {
        console.log(`Server is started on PORT: ${PORT}`);
        if (process.env.DB_SYNC) {
            db.sequelize.sync({ alter: true });
        }
    });
}

prepareAndStartServer();