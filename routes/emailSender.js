const nodemailer = require("nodemailer");
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

const ContactAdmin = (body) => {
  console.log("body: ", body);
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
    subject: `training request : from ${
      body.name + " " + body.surname
    }, mail : ${body.email}`,
    text: `${body.message}`,
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

const SendConfirmationEmail = (name, recipientEmail) => {
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
    to: recipientEmail,
    subject: "Confirmation de votre demande",
    text: `Bonjour ${name},\n\nVotre message a été envoyé avec succès.
    \n\nMerci,\nL'équipe de Diginnova Consulting`,
  };
  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

// Fonction pour envoyer un email de bienvenue
const sendCredentialsTrainerEmail = async (email, name, password) => {
  let transporter = nodemailer.createTransport({
    host: "mail.diginnova-consulting.com",
    port: 587,
    secure: false,
    auth: {
      user: "unow@diginnova-consulting.com",
      pass: "Zeineb@08",
    },
  });

  const mailOptions = {
    from: "unow@diginnova-consulting.com",
    to: email,
    subject: "WELCOME !",
    text: `Bonjour ${name},\n\nBienvenue  Voici vos informations de connexion :
    \n\nEmail : ${email}\nMot de passe : ${password}\n\nMerci,\nL'équipe de Diginnova Consulting`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("error while sending email:", error);
    throw error;
  }
};

module.exports = {
  Sender,
  ContactAdmin,
  sendCredentialsTrainerEmail,
  SendConfirmationEmail,
};
