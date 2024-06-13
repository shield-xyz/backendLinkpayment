const { LimitsService } = require('../services');
const { handleHttpError } = require('../utils/index.js');

const LimitsController = {
  async allLimits(req, res) {
    try {
      const limits = await LimitsService.findAll();
      res.send(limits);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getByCurrentUser(req, res) {
    const userId = req.body.user.id;
    if (!userId) {
      res.status(400).send({ message: 'User id can not be empty!' });
      return;
    }

    try {
      const limits = await LimitsService.getLimitsByUserId(userId);
      res.send(limits);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getLimitById(req, res) {
    const { limitId } = req.params;
    if (!limitId) {
      handleHttpError(new Error('Limit id can not be empty!'), res, 400);
      return;
    }

    try {
      const limit = await LimitsService.getLimitById(limitId);
      res.send(limit);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async updateLimit(req, res) {
    const { limitId } = req.params;
    if (!limitId) {
      handleHttpError(new Error('Limit id can not be empty!'), res, 400);
      return;
    }

    const { body } = req;
    if (!body) {
      handleHttpError(new Error('Request body can not be empty!'), res, 400);
      return;
    }

    const { user, ...rest } = body;

    try {
      const limit = await LimitsService.updateLimit(limitId, rest);
      res.send(limit);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

module.exports = LimitsController;
