const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


exports.sendOTPEmail = async (
  email,
  otp,
  customerName,
  subject = 'Your OTP for Device Collection'
) => {
  try {
    const mailOptions = {
      from: `"Cashify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #2563eb; }
            .otp { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Cashify Agent Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${customerName},</h2>
              <p>Our agent has arrived at your doorstep to collect your device.</p>
              <p>Please verify the agent using this OTP:</p>
              
              <div class="otp-box">
                <div class="otp">${otp}</div>
              </div>
              
              <p><strong>This OTP is valid for 5 minutes only.</strong></p>
              
              <p>If you did not request this, please contact our support immediately.</p>
              
              <p>Thank you for choosing Cashify!</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Cashify. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};


exports.sendOTPSMS = async (phone, otp) => {
  try {
    
    
    

    console.log(`OTP SMS would be sent to ${phone}: ${otp}`);

    
    return true;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    
    return false;
  }
};


exports.sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Cashify" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};


exports.sendSMS = async (phone, message) => {
  try {
    
    console.log(`SMS to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};


exports.sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    
    console.log(`Push notification to user ${userId}: ${title} - ${body}`);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
