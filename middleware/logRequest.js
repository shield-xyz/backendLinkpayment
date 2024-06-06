const logger = require('node-color-log');

function logRequest(req, res, next) {
  try {
    logger.info(
      `${req.method} ${req.url} | ${req.body?.user?.id ? `logged as userId: ${req.body?.user?.id} |` : ''
      } ${Object.keys(req.params).length
        ? `params: ${JSON.stringify(req.params)}`
        : ''
      }`
    );
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Unauthorized' });
    }
  }
}

module.exports = logRequest;
