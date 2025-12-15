const nodemailer = require('nodemailer');
const {
  asyncHandler,
  ApiError,
} = require('../middlewares/errorHandler.middleware');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

exports.sendContactEmail = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  try {
    if (
      process.env.NODE_ENV === 'development' &&
      (!process.env.EMAIL_USER ||
        process.env.EMAIL_USER === 'your-email@gmail.com')
    ) {
      console.log(
        '📧 Contact form submission (Email sending disabled in development):'
      );
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Phone:', phone);
      console.log('Subject:', subject);
      console.log('Message:', message);

      return res.status(200).json({
        success: true,
        message:
          'Your message has been received! (Development mode - email not sent)',
      });
    }

    const transporter = createTransporter();

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, 
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Details</h2>
            
            <div style="margin: 15px 0;">
              <strong style="color: #667eea;">Name:</strong> ${name}
            </div>
            
            <div style="margin: 15px 0;">
              <strong style="color: #667eea;">Email:</strong> 
              <a href="mailto:${email}" style="color: #764ba2; text-decoration: none;">${email}</a>
            </div>
            
            ${
              phone
                ? `
            <div style="margin: 15px 0;">
              <strong style="color: #667eea;">Phone:</strong> 
              <a href="tel:${phone}" style="color: #764ba2; text-decoration: none;">${phone}</a>
            </div>
            `
                : ''
            }
            
            <div style="margin: 15px 0;">
              <strong style="color: #667eea;">Subject:</strong> ${subject}
            </div>
            
            <div style="margin: 20px 0;">
              <strong style="color: #667eea;">Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin-top: 10px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f2ff; border-radius: 5px; border-left: 4px solid #667eea;">
              <strong style="color: #333;">Submitted on:</strong> ${new Date().toLocaleString(
                'en-IN',
                {
                  timeZone: 'Asia/Kolkata',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </div>
          </div>
          
          <div style="padding: 15px; background-color: #667eea; color: white; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">This email was sent from the Cashmitra contact form</p>
          </div>
        </div>
      `,
    };

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Cashmitra - We received your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear ${name},
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
              Thank you for reaching out to Cashmitra! We have received your message and our team will get back to you within 24 hours.
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Your Message Summary:</h3>
              <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 10px 0;"><strong>Message:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="background: #e8f2ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Need Immediate Assistance?</h3>
              <p style="margin: 10px 0;">📞 <strong>Phone:</strong> 1800-123-4567</p>
              <p style="margin: 10px 0;">📧 <strong>Email:</strong> support@cashmitra.com</p>
              <p style="margin: 10px 0;">🕒 <strong>Business Hours:</strong> Mon-Sat, 9 AM - 7 PM IST</p>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Best regards,<br>
              <strong>The Cashmitra Team</strong>
            </p>
          </div>
          
          <div style="padding: 15px; background-color: #667eea; color: white; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">
              Visit us at <a href="https://cashmitra.com" style="color: white; text-decoration: underline;">cashmitra.com</a>
            </p>
          </div>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    res.status(200).json({
      success: true,
      message:
        'Your message has been sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new ApiError(500, 'Failed to send email. Please try again later.');
  }
});

exports.getContactInfo = asyncHandler(async (req, res) => {
  const contactInfo = {
    phone: '1800-123-4567',
    email: 'support@cashmitra.com',
    address: 'Mumbai, Maharashtra, India',
    businessHours: 'Mon-Sat, 9 AM - 7 PM IST',
    socialMedia: {
      facebook: 'https://facebook.com/cashmitra',
      twitter: 'https://twitter.com/cashmitra',
      instagram: 'https://instagram.com/cashmitra',
      youtube: 'https://youtube.com/cashmitra',
    },
  };

  res.status(200).json({
    success: true,
    data: contactInfo,
  });
});
