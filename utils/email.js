import nodemailer from "nodemailer";
class Email {
  constructor(user, message) {
    this.name = user.name;
    this.email = user.email;
    this.email_from = `${process.env.EMAIL_FROM}`;
    this.message = message;
  }

  transportor() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject) {
    const mailOptions = {
      from: this.email_from,
      to: this.email,
      subject: subject,
      text: this.message,
      html: `<div style="padding:20px backround-color:blue, color:white"><h2>${subject}</h2>
         <h1>Hello ${this.name}</h1><p>${this.message}</p>
      </div>`,
    };

    await this.transportor().sendMail(mailOptions);
  }

  async sendArticlePublished() {
    await this.send("Your article was published");
  }

  async sendResetPassword() {
    await this.send("Your reset token password (Lasting of 10 minutes)");
  }
  async sendConfirmEmail() {
    await this.send("Please confirm your email");
  }
  async sendAcceptedEmail() {
    await this.send("Acceptance As A publisher");
  }
}

export default Email;
