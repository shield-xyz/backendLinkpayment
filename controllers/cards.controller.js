const { DebitCardService } = require('../services');
const { handleHttpError } = require('../utils');

const CardsController = {
  async findCardsFromAirtable(req, res) {
    try {
      const userId = req.body.user.id;

      const cards = await DebitCardService.find(userId);

      res.send(cards);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async findCardsFromRamp(req, res) {
    try {
      const userId = req.body.user.id;

      const cards = await DebitCardService.findFromRamp(userId);

      const cardsData = cards.map((card) => {
        return {
          cardholder_id: card.cardholder_id,
          cardholder_name: card.cardholder_name,
          display_name: card.display_name,
          expiration: card.expiration,
          id: card.id,
          last_four: card.last_four,
          spending_restrictions: card.spending_restrictions,
          state: card.state,
        };
      });
      res.send(cardsData);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

module.exports = CardsController;
