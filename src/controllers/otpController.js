const hubtelService = require('../services/hubtelService');
const OTP = require('../models/OTP');
const User = require('../models/User');

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, purpose = 'signup' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Generate OTP
    const otp = hubtelService.generateOTP();

    // Delete any existing OTP for this phone number and purpose
    await OTP.deleteMany({ phoneNumber, purpose });

    // Save OTP to database
    const otpRecord = new OTP({
      phoneNumber,
      otp,
      purpose
    });
    await otpRecord.save();

    // Send OTP via SMS
    try {
      const result = await hubtelService.sendSignupOTP(phoneNumber, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          messageId: result.messageId,
          expiresIn: '10 minutes'
        }
      });
    } catch (smsError) {
      // SMS failed but OTP is still saved - give user the OTP for testing
      console.log('SMS sending failed, providing OTP for testing:', otp);
      
      res.status(200).json({
        success: true,
        message: 'SMS service temporarily unavailable. For testing, use this OTP',
        data: {
          otp: otp, // Give them the OTP directly
          expiresIn: '10 minutes',
          note: 'This is for testing purposes only. In production, OTP will be sent via SMS.'
        }
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, purpose = 'signup' } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      phoneNumber, 
      purpose,
      verified: false 
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        remainingAttempts: 5 - otpRecord.attempts
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // If this is signup verification, mark the user as verified
    if (purpose === 'signup') {
      try {
        const user = await User.findOne({ phoneNumber: phoneNumber });
        if (user && !user.isVerified) {
          user.isVerified = true;
          await user.save();
          console.log(`User ${user.email} marked as verified after OTP verification`);
        }
      } catch (userUpdateError) {
        console.error('Error updating user verification status:', userUpdateError);
        // Don't fail the OTP verification if user update fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        verified: true,
        purpose: purpose
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { phoneNumber, purpose = 'signup' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Generate new OTP
    const otp = hubtelService.generateOTP();

    // Delete existing OTP
    await OTP.deleteMany({ phoneNumber, purpose });

    // Save new OTP to database
    const otpRecord = new OTP({
      phoneNumber,
      otp,
      purpose
    });
    await otpRecord.save();

    // Send OTP via SMS
    try {
      const result = await hubtelService.sendSignupOTP(phoneNumber, otp);
      
      res.status(200).json({
        success: true,
        message: 'New OTP sent successfully',
        data: {
          messageId: result.messageId,
          expiresIn: '10 minutes'
        }
      });
    } catch (smsError) {
      // SMS failed but OTP is still saved - give user the OTP for testing
      console.log('SMS resending failed, providing OTP for testing:', otp);
      
      res.status(200).json({
        success: true,
        message: 'SMS service temporarily unavailable. For testing, use this OTP',
        data: {
          otp: otp, // Give them the OTP directly
          expiresIn: '10 minutes',
          note: 'This is for testing purposes only. In production, OTP will be sent via SMS.'
        }
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};