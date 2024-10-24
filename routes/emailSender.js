const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "diginnova-consulting",
  host: "mail.diginnova-consulting.com",
  port: 587,
  secure: false,
  auth: {
    user: "unow@diginnova-consulting.com",
    pass: "Zeineb@08",
  },
});
const Sender = (mail, token) => {
  console.log("Sender", mail);

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

const sendPaymentConfirmationEmail = async (recipientEmail, itemType) => {
  const mailOptions = {
    from: "unow@diginnova-consulting.com",
    to: recipientEmail,
    subject: "Paiement effectué avec succès",
    text: `Bonjour,\n\nVotre paiement pour le ${itemType} a été effectué avec succès. 
   \n\nCordialement,\nL'équipe de Diginnova Consulting.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to" + recipientEmail);
  } catch (error) {
    console.error("error while  ", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
};

const sendEmailToAdmin = async (subject, message) => {
  console.log("hellooooooooooooooooo");
  try {
    await transporter.sendMail({
      from: "unow@diginnova-consulting.com",
      to: "hadilmlika@gmail.com",
      subject: subject,
      text: message,
    });
  } catch (error) {
    console.error("Error while sending email:", error);
  }
};

module.exports = {
  Sender,
  ContactAdmin,
  sendCredentialsTrainerEmail,
  SendConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendEmailToAdmin,
};
