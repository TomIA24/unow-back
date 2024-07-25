const nodemailer = require('nodemailer');
const Sender = (mail, token) => {
  console.log('Sender',mail);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mohamedaliezzeddine1@gmail.com",
      pass: "xray okgk fsfv lult",
    },
  });

  message = {
    from: "mohamedaliezzeddine1@gmail.com",
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
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mohamedaliezzeddine1@gmail.com",
      pass: "xray okgk fsfv lult",
    },
  });

  message = {
    from: "mohamedaliezzeddine1@gmail.com",
    to: "unow.elearning@gmail.com",
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