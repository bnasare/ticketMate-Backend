const axios = require('axios');

class HubtelSMSService {
  constructor() {
    this.clientId = process.env.HUBTEL_CLIENT_ID;
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    this.senderId = process.env.HUBTEL_SENDER_ID;
    this.baseUrl = process.env.HUBTEL_BASE_URL;
    
    if (!this.clientId || !this.clientSecret || !this.senderId || !this.baseUrl) {
      throw new Error('Hubtel SMS configuration is missing in environment variables');
    }
  }

  // Generate Basic Auth header
  getAuthHeader() {
    const credentials = `${this.clientId}:${this.clientSecret}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  }

  // Generate random 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP SMS for signup
  async sendSignupOTP(phoneNumber, otp) {
    try {
      // Clean and format phone number for Ghana
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      let formattedPhone = cleanPhone;
      if (cleanPhone.startsWith('0')) {
        formattedPhone = '+233' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('+233')) {
        formattedPhone = '+233' + cleanPhone;
      }

      const message = `Welcome to TicketMate! Your verification code is: ${otp}. This code expires in 10 minutes. Don't share this code with anyone.`;

      const payload = {
        From: this.senderId,
        To: formattedPhone,
        Content: message,
        ClientReference: `SIGNUP_OTP_${Date.now()}`,
        RegisteredDelivery: true
      };

      console.log('=== Sending Signup OTP ===');
      console.log('Phone:', `${formattedPhone.substring(0, 7)}****`);
      console.log('OTP:', otp);

      const response = await axios.post(
        'https://smsc.hubtel.com/v1/messages/send',
        payload,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      console.log('Hubtel response:', response.data);

      if (response.data && response.data.Status === 0) {
        return {
          success: true,
          messageId: response.data.MessageId,
          data: response.data
        };
      } else {
        throw new Error(response.data?.Message || 'SMS sending failed');
      }

    } catch (error) {
      console.error('Hubtel SMS error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.Message || error.message || 'Failed to send OTP');
    }
  }
}

module.exports = new HubtelSMSService();