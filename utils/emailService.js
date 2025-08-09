const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.setupTransporter();
    }

    async setupTransporter() {
        try {
            // Create transporter using Gmail SMTP
            this.transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME || 'samer2203013@miuegypt.edu.eg',
                    pass: process.env.EMAIL_PASSWORD // You'll need to set this
                }
            });

            // Verify connection
            await this.transporter.verify();
            console.log('✅ Email service is ready to send emails');
        } catch (error) {
            console.error('❌ Email service setup failed:', error.message);
            console.log('💡 Make sure to set EMAIL_PASSWORD in your environment variables');
            console.log('💡 For Gmail, you need to use an App Password, not your regular password');
        }
    }

    async sendPasswordResetEmail(userEmail, resetUrl, userName = '') {
        try {
            if (!this.transporter) {
                throw new Error('Email service not configured properly');
            }

            const mailOptions = {
                from: {
                    name: 'RedefineLab Gym',
                    address: process.env.EMAIL_USERNAME || 'samer2203013@miuegypt.edu.eg'
                },
                to: userEmail,
                subject: 'Reset Your RedefineLab Password',
                html: this.generatePasswordResetHTML(resetUrl, userName),
                text: this.generatePasswordResetText(resetUrl, userName)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully to:', userEmail);
            return result;

        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    generatePasswordResetHTML(resetUrl, userName) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - RedefineLab</title>
            <style>
                body {
                    font-family: 'Roboto', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 40px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ff6b35;
                    margin-bottom: 10px;
                }
                .title {
                    font-size: 28px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .content {
                    margin-bottom: 30px;
                }
                .reset-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #ff6b35, #f39c12);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    font-size: 16px;
                    text-align: center;
                    margin: 20px 0;
                    transition: all 0.3s ease;
                }
                .reset-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
                }
                .url-box {
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    word-break: break-all;
                    font-family: monospace;
                    font-size: 14px;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">🏋️‍♂️ REDEFINELAB</div>
                    <h1 class="title">Reset Your Password</h1>
                </div>
                
                <div class="content">
                    <p>Hi${userName ? ` ${userName}` : ''},</p>
                    
                    <p>We received a request to reset your password for your RedefineLab account. If you didn't make this request, you can safely ignore this email.</p>
                    
                    <p>To reset your password, click the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="reset-button">Reset My Password</a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    
                    <div class="url-box">
                        ${resetUrl}
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This link will expire in 10 minutes for security reasons. If you need a new link, please request another password reset.
                    </div>
                    
                    <p>If you're having trouble accessing your account or didn't request this reset, please contact our support team.</p>
                </div>
                
                <div class="footer">
                    <p><strong>RedefineLab Gym</strong></p>
                    <p>Transform Your Body, Redefine Your Life</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        This email was sent to ${userEmail}. If you no longer wish to receive these emails, 
                        you can update your preferences in your account settings.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generatePasswordResetText(resetUrl, userName) {
        return `
Reset Your RedefineLab Password

Hi${userName ? ` ${userName}` : ''},

We received a request to reset your password for your RedefineLab account. If you didn't make this request, you can safely ignore this email.

To reset your password, visit this link:
${resetUrl}

IMPORTANT: This link will expire in 10 minutes for security reasons.

If you're having trouble accessing your account or didn't request this reset, please contact our support team.

Best regards,
The RedefineLab Team
Transform Your Body, Redefine Your Life

---
This email was sent to ${userEmail}.
        `.trim();
    }

    async sendWelcomeEmail(userEmail, userName) {
        try {
            if (!this.transporter) {
                throw new Error('Email service not configured properly');
            }

            const mailOptions = {
                from: {
                    name: 'RedefineLab Gym',
                    address: process.env.EMAIL_USERNAME || 'samer2203013@miuegypt.edu.eg'
                },
                to: userEmail,
                subject: 'Welcome to RedefineLab - Your Fitness Journey Starts Now!',
                html: this.generateWelcomeHTML(userName),
                text: this.generateWelcomeText(userName)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent successfully to:', userEmail);
            return result;

        } catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            // Don't throw error for welcome email - it's not critical
        }
    }

    generateWelcomeHTML(userName) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to RedefineLab</title>
            <style>
                body {
                    font-family: 'Roboto', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 40px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ff6b35;
                    margin-bottom: 10px;
                }
                .title {
                    font-size: 28px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #ff6b35, #f39c12);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    font-size: 16px;
                    text-align: center;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">🏋️‍♂️ REDEFINELAB</div>
                    <h1 class="title">Welcome to RedefineLab!</h1>
                </div>
                
                <div class="content">
                    <p>Hi ${userName},</p>
                    
                    <p>Welcome to RedefineLab! We're excited to have you join our fitness community.</p>
                    
                    <p>Your account has been successfully created, and you're now ready to start your fitness transformation journey with us.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">Access Your Dashboard</a>
                    </div>
                    
                    <p>Get ready to redefine your limits and achieve your fitness goals!</p>
                </div>
                
                <div class="footer">
                    <p><strong>RedefineLab Gym</strong></p>
                    <p>Transform Your Body, Redefine Your Life</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateWelcomeText(userName) {
        return `
Welcome to RedefineLab!

Hi ${userName},

Welcome to RedefineLab! We're excited to have you join our fitness community.

Your account has been successfully created, and you're now ready to start your fitness transformation journey with us.

Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

Get ready to redefine your limits and achieve your fitness goals!

Best regards,
The RedefineLab Team
        `.trim();
    }
}

// Create and export a singleton instance
const emailService = new EmailService();
module.exports = emailService;