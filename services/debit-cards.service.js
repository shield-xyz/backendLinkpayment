const logger = require('node-color-log');


const { RAMP_API_URL } = require('../config');
const {
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
  baseDebitCards,
} = require('../utils/index.js');

class DebitCardService {
  static async create(data) {
    try {
      logger.info({ data });

      await baseDebitCards.create(data);

      return `User ${data.userId} created successfully in Airtable`;
    } catch (error) {
      handleError(
        error,
        `An error occurred while creating the user ${data.userId} in Airtable`
      );
    }
  }

  static async find(userId) {
    try {
      const records = await baseDebitCards
        .select({
          filterByFormula: `{userId} = "${userId}"`,
        })
        .firstPage();

      const debitCards = records
        .map((record) => {
          let fields = record.fields;
          let cards = [];

          for (let key in fields) {
            if (key.startsWith('card')) {
              cards.push(JSON.parse(fields[key]));
            }
          }

          return cards;
        })
        .flat();

      return debitCards;
    } catch (error) {
      handleError(
        error,
        `An error occurred while getting debit cards for user ${userId}`
      );
    }
  }

  static async findFromRamp(userId) {
    try {
      const rampUserId = await getRampUserId(userId);
      const token = await getRampToken();

      const cardsEndpoint = `${RAMP_API_URL}/cards?user_id=${rampUserId}`;

      const response = await fetch(cardsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `An error occurred while getting debit cards from Ramp for user ${userId}`
      );

      const cards = await response.json();

      return cards.data;
    } catch (error) {
      handleError(
        error,
        `An error occurred while getting debit cards from Ramp for user ${userId}`
      );
    }
  }
}

module.exports = { DebitCardService };
