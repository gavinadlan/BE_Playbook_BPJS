import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gavinadlan@gmail.com",
    pass: "dtxiskifehtwvvqf",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"Portal Developer PKS" <gavinadlan@gmail.com>',
    to: email,
    subject: "Verifikasi Email - Portal Developer PKS",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
          @media screen and (max-width: 600px) {
            .container { width: 95% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 20px; background-color: #f8f9fa; border-bottom: 1px solid #eeeeee;">
                    <img src="http://localhost:3000/images/logo.svg" alt="Logo Portal Developer PKS" width="150" style="display: block; margin: 0 auto;">
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 20px;">
                    <h1 style="color: #2d3436; margin-top: 0; text-align: center;">Verifikasi Email Anda</h1>
                    
                    <p style="line-height: 1.6; font-size: 16px;">Halo,</p>
                    <p style="line-height: 1.6; font-size: 16px;">Terima kasih telah mendaftar di Portal Developer PKS. Silakan verifikasi alamat email Anda untuk mengaktifkan akun:</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${verificationUrl}" 
                         style="background-color: #49A35A; color: #ffffff; padding: 12px 25px; 
                                text-decoration: none; border-radius: 5px; font-weight: bold; 
                                display: inline-block;">
                        Verifikasi Email Sekarang
                      </a>
                    </div>
                    
                    <p style="line-height: 1.6; font-size: 16px;">
                      Jika tombol tidak berfungsi, salin dan tempel tautan berikut di browser Anda:<br>
                      <span style="color: #49A35A; word-break: break-all;">${verificationUrl}</span>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 20px; background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 14px; color: #666666; text-align: center; margin: 0;">
                      Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.<br>
                      Untuk pertanyaan lebih lanjut, hubungi tim support di <a href="mailto:support@pksdeveloper.com" style="color: #49A35A;">support@pksdeveloper.com</a>
                    </p>
                    <p style="font-size: 12px; color: #999999; text-align: center; margin: 20px 0 0;">
                      © ${new Date().getFullYear()} Portal Developer PKS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetLink = `http://localhost:3000/lupa-password/reset?token=${token}`;

  await transporter.sendMail({
    from: '"Portal Developer PKS" <gavinadlan@gmail.com>',
    to: email,
    subject: "Permintaan Reset Password - Portal Developer PKS",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
          @media screen and (max-width: 600px) {
            .container { width: 95% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 20px; background-color: #f8f9fa; border-bottom: 1px solid #eeeeee;">
                    <img src="http://localhost:3000/images/logo.svg" alt="Logo Portal Developer PKS" width="150" style="display: block; margin: 0 auto;">
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 20px;">
                    <h1 style="color: #2d3436; margin-top: 0; text-align: center;">Reset Password Anda</h1>
                    
                    <p style="line-height: 1.6; font-size: 16px;">Halo,</p>
                    <p style="line-height: 1.6; font-size: 16px;">Kami menerima permintaan reset password untuk akun Anda. Silakan klik tombol di bawah ini untuk mengatur ulang password:</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${resetLink}" 
                         style="background-color: #49A35A; color: #ffffff; padding: 12px 25px; 
                                text-decoration: none; border-radius: 5px; font-weight: bold; 
                                display: inline-block;">
                        Reset Password
                      </a>
                    </div>
                    
                    <p style="line-height: 1.6; font-size: 16px;">
                      Jika tombol tidak berfungsi, salin dan tempel tautan berikut di browser Anda:<br>
                      <span style="color: #0984e3; word-break: break-all;">${resetLink}</span>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 20px; background-color: #f8f9fa; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 14px; color: #666666; text-align: center; margin: 0;">
                      Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.<br>
                      Untuk pertanyaan lebih lanjut, hubungi tim support di <a href="mailto:support@pksdeveloper.com" style="color: #0984e3;">support@pksdeveloper.com</a>
                    </p>
                    <p style="font-size: 12px; color: #999999; text-align: center; margin: 20px 0 0;">
                      © ${new Date().getFullYear()} Portal Developer PKS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}
