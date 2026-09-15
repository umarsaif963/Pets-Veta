const nodemailer = require('nodemailer');
const AppError = require('./AppError');
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const otpGenerator = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  return otp.toString();
}
const sendAppointmentConfirmationEmail = async (email, appointmentDetails) => {
  const { doctorName, checkupTime, appointmentCode } = appointmentDetails;

  const formattedTime = new Date(checkupTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  try {
    const info = await transporter.sendMail({
      from: 'abdullahsuleman755@gmail.com',
      to: email,
      subject: "🐾 Pets Veta Appointment Confirmation!",
      text: `Your appointment with Dr. ${doctorName} on ${formattedTime} is confirmed. Present Verification Code: ${appointmentCode} during your visit.`,
      html: `
      <body style="margin: 0; padding: 0; background-color: #eaf1ed; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eaf1ed; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fdfbf7; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
                
                <!-- Brand Title -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px;">
                    <table width="100%">
                      <tr>
                        <td width="50%">
                          <h2 style="color: #078b91; margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif;">Pets Veta</h2>
                          <p style="color: #553e2a; font-size: 13px; margin: 5px 0 0 0;">Compassion. Care. Trust.</p>
                        </td>
                        <td width="50%" style="text-align: right;">
                          <span style="font-size: 13px; font-weight: bold; color: #a58e7c; background-color: #faeadd; padding: 5px 12px; border-radius: 8px;">CONFIRMED</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Intro -->
                <tr>
                  <td style="padding: 20px 40px; text-align: center;">
                    <h1 style="color: #4a3320; font-size: 26px; margin-bottom: 10px;">Booking Confirmed!</h1>
                    <p style="color: #5a4b3e; font-size: 15px; line-height: 1.6; margin: 0;">
                      Your medical checkup session with <strong>Dr. ${doctorName}</strong> has been scheduled and funded successfully.
                    </p>
                  </td>
                </tr>

                <!-- Details Card -->
                <tr>
                  <td style="padding: 10px 40px;">
                    <div style="background-color: #f7fbfb; border: 1px solid #d4e2e0; border-radius: 16px; padding: 20px; text-align: left;">
                      <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px; font-family: sans-serif;"><strong>Consultation Date & Time:</strong></p>
                      <p style="margin: 0; color: #078b91; font-size: 16px; font-weight: bold;">${formattedTime}</p>
                    </div>
                  </td>
                </tr>

                <!-- Verification Box -->
                <tr>
                  <td align="center" style="padding: 30px 40px 40px 40px; text-align: center;">
                    <p style="color: #4a3320; font-size: 13px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Present this verification code to the doctor during your visit:
                    </p>
                    <div style="background: #faeadd; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #5a3f28; border-radius: 12px; display: inline-block; min-width: 220px; border: 2px dashed #e5ccbe;">
                      ${appointmentCode}
                    </div>
                    <p style="color: #8c7b70; font-size: 12px; margin-top: 20px; line-height: 1.6; max-width: 440px;">
                      Please keep this code secure. The doctor will verify this code during the checkup to securely authorize and release the consult payment from the platform.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      `,
    });

    console.log("Appointment confirmation email sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Failed to send appointment confirmation email:", err);
    throw err;
  }
};


const sendOtp = async (email, otpCode) => {
  try {
    const info = await transporter.sendMail({
      from: 'abdullahsuleman755@gmail.com',
      to: email,
      subject: "OTP Code",
      text: "Your OTP Code", // fallback
      html: `
  <body style="margin: 0; padding: 0; background-color: #eaf1ed; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eaf1ed; padding: 40px 20px;">
      <tr>
        <td align="center">

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fdfbf7; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <table width="100%">
                  <tr>
                    <td width="50%">
                      <img src="YOUR_LOGO_URL_HERE.png" style="width: 140px;" />
                      <p style="color: #553e2a; font-size: 13px;">Compassion. Care. Trust.</p>
                    </td>
                    <td width="50%" style="text-align: right;">
                      <img src="YOUR_HEADER_IMAGE_URL_HERE.png" style="width: 200px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td align="center" style="padding: 20px;">
                <h1 style="color: #4a3320;">Your OTP Code</h1>
                <p style="color: #4a3320;">
                  Use the code below to verify your account
                </p>
              </td>
            </tr>

            <!-- OTP -->
            <tr>
              <td align="center" style="padding: 30px;">
                <div style="background:#faeadd; padding:20px; font-size:40px; font-weight:bold; letter-spacing:10px; color:#5a3f28; border-radius:12px;">
                  ${otpCode}
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  `,
    });

    console.log("Message sent: %s", info.messageId);


    return info;

  } catch (err) {
    console.error("Error while sending mail:", err);

    throw new AppError(`Error is Sending Mail to ${email} ${err.message}`);
  }
}

const sendStatusEmail = async (email, status) => {
  const isApproved = status.toLowerCase() === 'approved';

  // Dynamic branding configuration based on approval/rejection status
  const config = {
    subject: isApproved ? " Welcome to the Pack! Your Application is Approved" : "Update Regarding Your Application",
    title: isApproved ? "Application Approved!" : "Application Status Update",
    accentColor: isApproved ? "#2e7d32" : "#d32f2f",
    bgColor: isApproved ? "#e8f5e9" : "#ffebee",
    messageHtml: isApproved
      ? `We are absolutely thrilled to welcome you to the family! Our team has verified your credentials, and your profile is now live. Let's make the world a happier, healthier place for our furry friends together! 🐾`
      : `Thank you for taking the time to apply with us. After a careful review of your profile, we regret to inform you that we cannot approve your application at this time. We sincerely appreciate your love and dedication to pet care. 🐾`,
    badgeText: isApproved ? "APPROVED" : "NOT APPROVED"
  };

  try {
    const info = await transporter.sendMail({
      from: 'abdullahsuleman755@gmail.com',
      to: email,
      subject: config.subject,
      text: isApproved ? "Your application has been approved." : "Your application has been rejected.", // Fallback
      html: `
      <body style="margin: 0; padding: 0; background-color: #eaf1ed; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eaf1ed; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fdfbf7; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
                
                <tr>
                  <td style="padding: 40px 40px 20px 40px;">
                    <table width="100%">
                      <tr>
                        <td width="50%">
                          <img src="YOUR_LOGO_URL_HERE.png" style="width: 140px;" alt="Logo" />
                          <p style="color: #553e2a; font-size: 13px; margin: 5px 0 0 0;">Compassion. Care. Trust.</p>
                        </td>
                        <td width="50%" style="text-align: right;">
                          <img src="YOUR_HEADER_IMAGE_URL_HERE.png" style="width: 200px;" alt="Pets Veta Header" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 40px; text-align: center;">
                    <h1 style="color: #4a3320; font-size: 28px; margin-bottom: 10px;">${config.title}</h1>
                    <p style="color: #5a4b3e; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                      ${config.messageHtml}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 50px;">
                    <div style="background: ${config.bgColor}; max-width: 200px; padding: 15px 25px; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: ${config.accentColor}; border: 2px solid ${config.accentColor}; border-radius: 12px; text-align: center;">
                      ${config.badgeText}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      `,
    });

    console.log("Status email sent successfully: %s", info.messageId);
    return info;

  } catch (err) {
    console.error("Error sending status email:", err);
    throw err;
  }
};

module.exports = {
  otpGenerator,
  sendOtp,
  sendStatusEmail,
  sendAppointmentConfirmationEmail
}