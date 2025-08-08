const axios = require('axios');
const crypto = require('crypto');

class PaystackService {
  constructor() {
    this.baseURL = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required in environment variables');
    }
  }

  async initializeTransaction(transactionData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email: transactionData.email,
          amount: transactionData.amount * 100,
          reference: transactionData.reference,
          callback_url: transactionData.callback_url,
          metadata: {
            ...transactionData.metadata,
            cancel_action: transactionData.callback_url
          },
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
          currency: 'GHS'
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to initialize payment'
      );
    }
  }

  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to verify payment'
      );
    }
  }

  generateReference(prefix = 'TM') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  verifyWebhookSignature(body, signature) {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(body))
      .digest('hex');
    
    return hash === signature;
  }

  async getTransactionHistory(page = 1, perPage = 50) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction?page=${page}&perPage=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack history error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch transaction history'
      );
    }
  }

  async refundTransaction(reference, amount = null) {
    try {
      const refundData = { transaction: reference };
      if (amount) {
        refundData.amount = amount * 100;
      }

      const response = await axios.post(
        `${this.baseURL}/refund`,
        refundData,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to process refund'
      );
    }
  }
}

module.exports = new PaystackService();