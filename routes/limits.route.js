const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const limitsController = require('../controllers/limits.controller');

router.get('/', auth, logRequest, limitsController.allLimits);
router.get(
  '/get-by-current-user',
  auth,
  logRequest,
  limitsController.getByCurrentUser
);
router.get('/:limitId', auth, logRequest, limitsController.getLimitById);
router.patch('/:limitId', auth, logRequest, limitsController.updateLimit);

module.exports = router;
