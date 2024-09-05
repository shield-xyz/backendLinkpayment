const userModel = require('../models/user.model');

const WebhookController = {
  async verify(req, res) {
    try {
      const body = req.body;

      switch (body.event_kind) {
        case 'footprint.onboarding.completed':
        case 'footprint.onboarding.status_changed':
          const { fp_id, status, new_status } = body || {};

          const user = await userModel.findOne({
            footId: fp_id,
          });

          const { _id } = user;

          if (!_id) {
            return res.status(404).send({
              message: `User with footId ${fp_id} not found`,
            });
          }

          // Statuses: pass fail incomplete pending none
          if (status !== 'pass' && new_status !== 'pass') {
            return res.status(200).send({
              message: `User with _id ${_id} and footId ${fp_id} has failed the onboarding`,
            });
          }

          await userModel.findByIdAndUpdate(_id, {
            verify: true,
          });

          return res.status(200).send({
            message: `User with _id ${_id} and footId ${fp_id} has been verified successfully`,
          });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = WebhookController;
