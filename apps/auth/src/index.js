const app = require('./app');
const { PORT } = require('./config/server-config');
const db = require('./models/index');

const prepareAndStartServer = () => {
  app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
    if (process.env.DB_SYNC) {
      db.sequelize.sync({ alter: true });
    }
  });
};

prepareAndStartServer();
