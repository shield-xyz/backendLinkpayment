const {
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
} = require('../utils/index.js');
const { BalanceService } = require('./balance.service');

class LimitsService {
  static async findAll() {
    try {
      const token = await getRampToken();

      const response = await fetch(`${process.env.RAMP_API_URL}/limits`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(response, 'An error occurred while getting limits');

      const limits = await response.json();
      const data = limits.data;

      return data;
    } catch (error) {
      handleError(error, 'An error occurred while getting limits');
    }
  }

  static async getRampLimitsByRampUserId(rampUserId) {
    try {
      const token = await getRampToken();

      const response = await fetch(
        `${process.env.RAMP_API_URL}/limits?user_id=${rampUserId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      validateResponse(
        response,
        `An error occurred while getting limits for rampUserId ${rampUserId}`
      );

      const limits = await response.json();
      const data = limits.data;

      return data;
    } catch (error) {
      handleError(error, 'An error occurred while getting limits by user id');
    }
  }

  static async getLimitsByUserId(userId) {
    try {
      const rampUserId = await getRampUserId(userId);

      const data = await this.getRampLimitsByRampUserId(rampUserId);

      return data;
    } catch (error) {
      handleError(error, 'An error occurred while getting limits by user id');
    }
  }

  static async getLimitsByRampUserId(rampUserId) {
    try {
      const data = await this.getRampLimitsByRampUserId(rampUserId);

      return data;
    } catch (error) {
      handleError(
        error,
        'An error occurred while getting limits by ramp user id'
      );
    }
  }

  static calculateTotalsInUSD(limits) {
    let totalSpent = 0;
    let totalLimit = 0;

    for (const limit of limits) {
      totalLimit += limit.restrictions.limit.amount;
      totalSpent += limit.balance.total.amount;
    }

    const totalRemaining = totalLimit - totalSpent;

    return {
      totalSpent: totalSpent / 100,
      totalLimit: totalLimit / 100,
      totalRemaining: totalRemaining / 100,
    };
  }

  static async getLimitById(limitId) {
    try {
      const token = await getRampToken();

      const response = await fetch(
        `${process.env.RAMP_API_URL}/limits/${limitId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      validateResponse(
        response,
        `An error occurred while getting limit by id: ${limitId}`
      );

      const limit = await response.json();

      return limit;
    } catch (error) {
      handleError(error, 'An error occurred while getting limit by id');
    }
  }

  static async updateLimit(spend_limit_id, body) {
    try {
      const token = await getRampToken();

      const response = await fetch(
        `${process.env.RAMP_API_URL}/limits/${spend_limit_id}`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      validateResponse(
        response,
        `An error occurred while updating limit: ${spend_limit_id}`
      );

      const limit = await response.json();

      return limit;
    } catch (error) {
      handleError(error, 'An error occurred while updating limit');
    }
  }

  static async updateUserSpendLimits(rampUserId, totalBalanceInUSD) {
    try {
      const limits = await this.getLimitsByRampUserId(rampUserId);

      const limitsLength = limits.length;

      if (limitsLength === 0) {
        throw new Error('No limits found for this user');
      }

      const totals = this.calculateTotalsInUSD(limits);

      const newTotalLimit = totals.totalSpent + totalBalanceInUSD;

      // TODO: update all limits. Updating only first limit for now
      const limit = limits[0];
      const newLimit = {
        spending_restrictions: {
          limit: {
            amount: newTotalLimit * 100, // Convert to cents
            currency_code: 'USD',
          },
          interval: 'TOTAL',
        },
      };

      const limitUpdated = await this.updateLimit(limit.id, newLimit);

      return limitUpdated;
    } catch (error) {
      handleError(error, 'An error occurred while updating user spend limits');
    }
  }

  static async syncUserSpendLimits(userId) {
    try {
      const rampUserId = await getRampUserId(userId);

      const totalUserUSDBalance = await BalanceService.getTotalUSDUserBalance(
        userId
      );

      const limit = await this.updateUserSpendLimits(
        rampUserId,
        totalUserUSDBalance
      );

      return limit;
    } catch (error) {
      handleError(error, 'An error occurred while syncing user spend limits');
    }
  }
}

module.exports = { LimitsService };
