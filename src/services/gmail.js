import Config from '../config';
import nodemailer from 'nodemailer';

class Gmail {


  constructor() {
    this.owner = {
      name: Config.GMAIL_NAME,
      address: Config.GMAIL_EMAIL,
    };

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: Config.GMAIL_EMAIL,
        pass: Config.GMAIL_PASSWORD,
      },
    });

    this.transporter.verify().then(() => console.log('READY To Send Email'));
  }

  async sendEmail(dest, subject, content) {
    const mailOptions = {
      from: this.owner,
      to: dest,
      subject,
      html: content
    };
    console.log('Enviando Mail')
    const response = await this.transporter.sendMail(mailOptions);
    return response;
  }
}

export const GmailService = new Gmail();