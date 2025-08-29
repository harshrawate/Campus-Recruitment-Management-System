const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendUserAddedMail = async (to, password) => {
  const loginLink = process.env.CLIENT_URL + `/login/admin`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Account Successfully Created",
    text: `Your account has been successfully created.\n\nPassword: ${password}\n\nPlease log in and change your password as soon as possible.\n\nClick the following link to log in:\n${loginLink}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Created</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #6366F1;;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin-top: 20px;
          background-color: #6366F1;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          text-align: center;
        }
        .button:hover {
          background-color: #4F46E5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Your account has been successfully created!</h2>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password as soon as possible.</p>
        <a href="${loginLink}" class="button">Login and Change Password</a>
      </div>
    </body>
    </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("User added mail sent successfully");
  } catch (error) {
    console.error("Error sending user added mail:", error);
  }
};

exports.sendUniversityCreationMail = async (to, universityName, password) => {
  const loginLink = `${process.env.CLIENT_URL}/login/faculty`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "University and Account Successfully Created",
    text: `
      Dear User,

      Congratulations! The university "${universityName}" has been successfully registered, and your account as the Head of the University has been created.

      Your login credentials are as follows:
      - Username: ${to}
      - Password: ${password}

      Please log in using the link below and change your password for security purposes:
      ${loginLink}

      If you have any questions, feel free to reach out to our support team.

      Best regards,
      [Your Organization Name]
    `,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>University and Account Created</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #6366F1;
          }
          .button {
            background-color: #6366F1;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
          }
          .button:hover {
            background-color: #4F46E5;
          }
          p {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>University and Account Successfully Created!</h2>
          <p>Dear User,</p>
          <p>
            Congratulations! The university "<strong>${universityName}</strong>" has been successfully registered, and your account as the Head of the University has been created.
          </p>
          <p>
            <strong>Your login credentials:</strong><br>
            - Username: ${to}<br>
            - Password: ${password}
          </p>
          <p>Please log in using the link below and change your password for security purposes:</p>
          <a href="${loginLink}" class="button">Login and Change Password</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,</p>
          <p>Smart Recruiter Platform</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("University creation email sent successfully");
  } catch (error) {
    console.error("Error sending university creation email:", error);
  }
};

exports.sendFacultyAccountCreationMail = async (to, password, name) => {
  const loginLink = `${process.env.CLIENT_URL}/login/faculty`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Faculty Account Created",
    text: `Dear ${name},

    Congratulations! Your account as a faculty member has been successfully created.

    Your login credentials are as follows:
    - Username: ${to}
    - Password: ${password}

    Please log in using the link below and change your password for security purposes:
    ${loginLink}

    If you have any questions, feel free to reach out to our support team.

    Best regards,
    Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Creation Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #6366F1;
          }
          .button {
            background-color: #6366F1;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
          }
          .button:hover {
            background-color: #4F46E5;
          }
          p {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>Account Created Successfully!</h2>
          <p>Dear ${name},</p>
          <p>
            Congratulations! Your account as a faculty member has been successfully created.
          </p>
          <p>
            <strong>Your login credentials:</strong><br>
            - Username: ${to}<br>
            - Password: ${password}
          </p>
          <p>Please log in using the link below and change your password for security purposes:</p>
          <a href="${loginLink}" class="button">Login and Change Password</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,</p>
          <p>Campus Recruitment Gateway</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Faculty account creation email sent successfully");
  } catch (error) {
    console.error("Error sending faculty account creation email:", error);
  }
};

exports.sendPasswordChangeMail = async (to, name, newPassword) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Password Changed Successfully",
    text: `Dear ${name},

    Your password has been successfully changed. Your new password is:
    ${newPassword}

    If you did not request this change, please contact our support team immediately to secure your account.

    Best regards,
    Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #6366F1;
          }
          p {
            line-height: 1.6;
          }
          .highlight {
            font-weight: bold;
            color: #6366F1;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>Password Changed Successfully</h2>
          <p>Dear ${name},</p>
          <p>Your password has been successfully changed.</p>
          <p><strong>Your new password is:</strong> <span class="highlight">${newPassword}</span></p>
          <p>If you did not request this change, please contact our support team immediately to secure your account.</p>
          <p>Best regards,</p>
          <p>[Your Organization Name]</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password change email sent successfully");
  } catch (error) {
    console.error("Error sending password change email:", error);
  }
};

exports.sendResetPasswordMail = async (to, name, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Reset Your Password",
    text: `Hello ${name},

You recently requested to reset your password. Please click on the link below to reset your password:

${resetLink}

The link is valid for 5 minutes only.

If the button does not work, use the link below:
${resetLink}

If you did not request this, please ignore this email or contact support if you have questions.

Best regards,
Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #3f51b5;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            line-height: 1.8;
            margin: 15px 0;
            font-size: 16px;
          }
          a {
            color: #ffffff;
            text-decoration: none;
          }
          .button {
            display: inline-block;
            background-color: #3f51b5;
            color: #ffffff !important;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 10px;
            text-decoration: none;
            font-weight: bold;
          }
          .button:hover {
            background-color: #303f9f;
          }
          .note {
            font-size: 14px;
            color: #777;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>Hello ${name},</h2>
          <p>You recently requested to reset your password.</p>
          <p>Click the button below to reset your password:</p>
          <p>
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p class="note">If the button does not work, use the link below:</p>
          <p>
            <a href="${resetLink}" style="color: #3f51b5;">${resetLink}</a>
          </p>
          <p class="highlight">The link is valid for 5 minutes only!</p>
          <p>If you did not request this, please ignore this email or contact support if you have questions.</p>
          <p class="footer">Best regards,<br/>Campus Recruitment Gateway</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Error sending reset password email:", error);
  }
};

exports.sendPasswordResetSuccessMail = async (to, name, role) => {
  const loginLink = `${process.env.CLIENT_URL}/login/${role}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Password Successfully Reset",
    text: `Dear ${name},

Your password has been successfully reset. You can now log in with your new credentials.

If you did not make this change, please contact our support team immediately.

Best regards,
Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #6366F1;
          }
          .button {
            background-color: #6366F1;
            color: #ffffff !important;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #4F46E5;
          }
          p {
            line-height: 1.6;
          }
          .security-note {
            background-color: #F0F4F8;
            border-left: 4px solid #6366F1;
            padding: 10px;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>Password Reset Successful</h2>
          <p>Dear ${name},</p>
          <p>Your password has been successfully reset. You can now log in to your account using your new credentials.</p>
          <a href="${loginLink}" class="button">Login to Your Account</a>
          
          <div class="security-note">
            <p><strong>Security Tip:</strong> If you did not make this change, please contact our support team immediately to secure your account.</p>
          </div>
          
          <p>Best regards,</p>
          <p>Campus Recruitment Gateway</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent successfully");
  } catch (error) {
    console.error("Error sending password reset success email:", error);
  }
};

exports.sendOTPMail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Your One-Time Password (OTP) for Verification",
    text: `Dear User,

Your One-Time Password (OTP) for verification is: ${otp}

This OTP is valid for 2 minutes. Please do not share this code with anyone.

If you did not request this OTP, please ignore this email or contact our support team.

Best regards,
Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>One-Time Password (OTP) Verification</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-header {
            background-color: #6366F1;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 30px;
          }
          .otp-code {
            background-color: #F0F4F8;
            border-left: 4px solid #6366F1;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            letter-spacing: 5px;
            margin: 20px 0;
            color: #2D3748;
            font-weight: bold;
          }
          .email-footer {
            background-color: #F7FAFC;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #718096;
          }
          .security-note {
            background-color: #EDF2F7;
            border-radius: 5px;
            padding: 10px;
            margin-top: 20px;
            font-size: 14px;
            color: #4A5568;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>OTP Verification</h1>
          </div>
          <div class="email-body">
            <p>Dear User,</p>
            <p>To complete your verification, please use the One-Time Password (OTP) below:</p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <p>This OTP is valid for <strong>2 minutes</strong>. Please do not share this code with anyone.</p>
            
            <div class="security-note">
              <strong>Security Note:</strong> We will never ask you to share your OTP. Keep it confidential.
            </div>
          </div>
          <div class="email-footer">
            © 2025 Campus Recruitment Gateway. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

exports.sendProfileUpdateReminderMail = async (to, name) => {
  const profileLink = `${process.env.CLIENT_URL}/student/update-profile`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Update Your Profile to Access Placement Opportunities!",
    text: `Dear ${name},

Important Notice: Update Your Profile for Placement Opportunities!

We noticed your profile needs to be updated. A complete profile is essential to:
- Participate in upcoming placement drives
- Get shortlisted for interviews

Don't miss out on your dream job opportunity. Update your profile today!

Update your profile here: ${profileLink}

Best regards,
Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Update Your Profile for Placement Opportunities</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-header {
            background-color: #6366F1;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 30px;
          }
          .alert-box {
            background-color: #FEF2F2;
            border-left: 4px solid #DC2626;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #6366F1;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
          }
          .opportunities-box {
            background-color: #F0FDF4;
            border-left: 4px solid #16A34A;
            padding: 15px;
            margin: 20px 0;
          }
          .benefits-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .benefit-item {
            background-color: #F8FAFC;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Important Notice for Placements!</h1>
          </div>
          <div class="email-body">
            <p>Dear ${name},</p>
            
            <div class="alert-box">
              <strong>⚠️ Action Required:</strong> Please update your profile to participate in upcoming placement drives!
            </div>
            
            <div class="opportunities-box">
              <h3 style="margin-top: 0;">🎯 Unlock Placement Opportunities</h3>
              <p>A complete profile helps you:</p>
              <ul>
                <li>Participate in campus placement drives</li>
                <li>Get noticed by top companies</li>
                <li>Receive interview calls</li>
                <li>Start your career journey</li>
              </ul>
            </div>

            <div class="benefits-grid">
              <div class="benefit-item">
                <h4>🎯 Get Shortlisted</h4>
                <p>Increase your chances of selection</p>
              </div>
              <div class="benefit-item">
                <h4>🔔 Job Alerts</h4>
                <p>Get notified of matching opportunities</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${profileLink}" class="button">Update Your Profile Now</a>
            </div>
            
            <p style="margin-top: 30px; color: #64748B; font-size: 14px;">
              Note: Only students with complete profiles will be considered for upcoming placement opportunities.
            </p>
            
            <p style="margin-top: 30px;">Best regards,<br>Campus Recruitment Gateway</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending profile update reminder:", error);
    return false;
  }
};

exports.sendBulkNotification = async (emails, subject, content) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    bcc: emails,
    subject: subject,
    text: content,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${content}
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    return false;
  }
};
