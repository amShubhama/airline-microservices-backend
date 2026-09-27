const app = require('./app');
const { PORT } = require('./config/server-config');
const db = require('./models/index');

const setupAndStartServer = async () => {
  try {
    app.listen(PORT, async () => {
      console.log(`Flight Service is running on port ${PORT}`);
      if (process.env.DB_SYNC) {
        await db.sequelize.sync({ alter: true });
      }
    });
  } catch (error) {
    console.error('Failed to start Flight Service:', error);
    process.exit(1);
  }
};

setupAndStartServer();
