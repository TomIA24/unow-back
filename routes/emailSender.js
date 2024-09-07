const nodemailer = require('nodemailer');
const Sender = (mail, token) => {
  console.log("Sender", mail);

  let transporter = nodemailer.createTransport({
    service: "diginnova-consulting",
    host: "mail.diginnova-consulting.com",
    port: 465,
    secure: false,
    auth: {
      // user: "mohamedaliezzeddine1@gmail.com",
      // pass: "xray okgk fsfv lult",
      user: "unow@diginnova-consulting.com",
      pass: "Zeineb@08",
    },
  });

  message = {
    from: "unow@diginnova-consulting.com",
    to: mail,
    subject: "Subject",
    text: `Verification Code ${token}`,
  };
  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
      console.log(mail);
    }
  });
};

const ContactAdmin = (name, surname, mail, Message, subject) => {
  let transporter = nodemailer.createTransport({
    service: "diginnova-consulting",
    host: "mail.diginnova-consulting.com",
    port: 587,
    secure: false,
    auth: {
      user: "unow@diginnova-consulting.com",
      pass: "Zeineb@08",
    },
  });

  message = {
    from: "unow@diginnova-consulting.com",
    to: "elayeb.oussama2020@gmail.com",
    subject: `${subject}: from ${name + " " + surname}`,
    text: `${Message}`,
  };
  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
      console.log(mail);
    }
  });
};



module.exports = { Sender, ContactAdmin }