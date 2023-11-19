const nodemailer = require("nodemailer");
// require("dotenv").config();
const Email = class {
  constructor(user, houseId) {
    this.to = user.email;
    this.from = process.env.EMAIL_FROM;
    this.houseId = houseId;
  }
  createTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(subject) {
    const html = `
  <body style="background-color:white;height:100%; width:100%">
  <div styles="min-height:100vh; width:100%; padding:20px">
  <h2>${subject}</h2>
  <p>Below is your unique House Identity number : </p>
  <p style="font-size:2rem;font-weight:600;padding:10px">${this.houseId}</p>
  <p>If you didn't request for this code, you can safely ignore this message. Someone might have typed your email address by mistake <br/> Thanks.</p>
  </div>
  </body>
  `;

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };
    // create transpoter
    await this.createTransporter().sendMail(
      mailOptions,
      function (err, success) {
        if (err) {
          console.log(err);
        }
        console.log("Email sent successfully");
      },
    );
  }
  async sendUniqueId() {
    await this.send("Welcome to Telectify");
  }
};

module.exports = Email;
