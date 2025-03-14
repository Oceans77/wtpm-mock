const app = require('./app');
const config = require('./config');
const { logger } = require('./utils/logger');

const port = config.default?.port || 3000;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
