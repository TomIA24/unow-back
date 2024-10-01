require("dotenv").config();
const express = require("express");
//const fileUpload = require('express-fileupload');
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const connection = require("./db");
const clientRoutes = require("./routes/CandidatControle");
const paymentRoutes = require("./routes/paymentControle");
const trainerRoutes = require("./routes/trainerControle");
const authRoutes = require("./routes/LoginControle");
const contactRoutes = require("./routes/contactControle");
const userDataRoutes = require("./routes/userControle");
const trainingDataRoutes = require("./routes/trainingControle");
const courseDataRoutes = require("./routes/courseControle");
const notificationsRoutes = require("./routes/notificationsControle");
const Room = require("./routes/RoomsControle");
const { Room: RoomModel } = require("./models/Room");
const newsletter = require("./routes/newsletterControle");
const evaluationsRoutes = require("./routes/EvaluationsControle");
const CategoryRoutes = require("./routes/CategoryControle");
const programRoutes = require("./routes/programRoute");
const quizRoutes = require("./routes/QuizControle");
// const upload = require("./routes/Ressources");
const upload = require("./routes/file-upload-routes");
const download = require("./routes/file-download-routes");

const https = require("https");
const http = require("http");
const fs = require("fs");
var xss = require("xss");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// database connection
connection();

/////////

// middlewares
app.use(express.json());
/*var whitelist = ['https://u!now.tn', 'http://u!now.tn', 'https://skilzit.urbatil.com', 'https://testroom.urbatil.com' ]

app.use(cors(
    {
        origin:  function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
              callback(null, true)
            } else {
              callback(new Error('Not allowed by CORSs'))
            }
          },
        credentials: true,
        
    }
  ));
        
        
    //app.use(function(req, res, next) {
    //    const allowedOrigins = ['https://u!now.tn', 'http://u!now.tn', 'https://skilzit.urbatil.com', 'https://testroom.urbatil.com' ];
    //    const origin = req.headers.origin;
    //        if (allowedOrigins.includes(origin)) {
    //           res.Header('Access-Control-Allow-Origin', origin);
    //      }
    //    res.header("X-Requested-With", "XMLHttpRequest");
      next();
    });*/

app.use(cors({ origin: "*" }));

// Add headers before the routes are defined
// app.use(function (req, res, next) {
//   //     // Website you wish to allow to connect
//   res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT);

//   // Request methods you wish to allow
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );

//   // Request headers you wish to allow
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type,Access-control-request-methods,Access-Control-Allow-Origin,authorization,name,id,courseId,type"
//   );

//   res.header("X-Requested-With", "XMLHttpRequest");

//   // Set to true if you need the we
//   res.setHeader("Access-Control-Allow-Credentials", true);

//   // Pass to next layer of middleware
//   next();
// });

//app.use(fileUpload());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/quiz", quizRoutes);
app.use("/api/candidat", clientRoutes);
app.use("/api/Trainer", trainerRoutes);
app.use("/api/userData", userDataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/trainings", trainingDataRoutes);
app.use("/api/courses", courseDataRoutes);

app.use("/api/newsletter", newsletter);

app.use("/api/payment", paymentRoutes);
app.use("/api/evaluations", evaluationsRoutes);
app.use("/api/Category", CategoryRoutes);
app.use("/api/programs", programRoutes);

app.use("/api/notifications", notificationsRoutes);
app.use("/api/Room", Room);
app.use("/api/upload", upload.routes);
app.use("/api/download", download.routes);

const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const sanitizeString = (str) => xss(str);
let connections = {};
let messages = {};
let timeOnline = {};

io.on("connection", (socket) => {
  // Join Call Event
  socket.on("join-call", async ({ path, userId }) => {
    console.log(path.split("room/")[1]);
    console.log(userId);
    const urlIdFromPath = path.split("room/")[1];
    const room = await RoomModel.find({ urlId: urlIdFromPath });
    console.log(room);
    console.log("masters: ", room[0]?.masters);
    console.log("userId: ", userId);
    const userRole = room[0]?.masters?.includes(userId) ? "master" : "user";
    if (!connections[urlIdFromPath]) {
      connections[urlIdFromPath] = [];
    }
    connections[urlIdFromPath].push(socket.id);
    timeOnline[socket.id] = new Date();

    // Notify others in the room
    connections[urlIdFromPath].forEach((id) => {
      io.to(id).emit(
        "user-joined",
        socket.id,
        connections[urlIdFromPath],
        userRole
      );
    });

    // Send chat history to the new user
    if (messages[urlIdFromPath]) {
      messages[urlIdFromPath].forEach((msg) => {
        io.to(socket.id).emit(
          "chat-message",
          msg.data,
          msg.sender,
          msg["socket-id-sender"]
        );
      });
    }

    console.log(`${socket.id} joined the room: ${urlIdFromPath}`);
  });

  // Signal Event for WebRTC communication
  socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
  });

  // Chat Message Event
  socket.on("chat-message", (data, sender) => {
    const sanitizedData = sanitizeString(data);
    const sanitizedSender = sanitizeString(sender);
    const room = Object.keys(connections).find((key) =>
      connections[key].includes(socket.id)
    );

    if (room) {
      if (!messages[room]) {
        messages[room] = [];
      }
      // Store message
      messages[room].push({
        sender: sanitizedSender,
        data: sanitizedData,
        "socket-id-sender": socket.id,
      });

      // Broadcast message to the room
      connections[room].forEach((id) => {
        io.to(id).emit(
          "chat-message",
          sanitizedData,
          sanitizedSender,
          socket.id
        );
      });

      console.log(
        `Message in room ${room}: ${sanitizedSender}: ${sanitizedData}`
      );
    }
  });

  // Handle Disconnection
  socket.on("disconnect", () => {
    const room = Object.keys(connections).find((key) =>
      connections[key].includes(socket.id)
    );

    if (room) {
      connections[room] = connections[room].filter((id) => id !== socket.id);
      if (connections[room].length === 0) delete connections[room];

      // Notify users in the room
      connections[room]?.forEach((id) =>
        io.to(id).emit("user-left", socket.id)
      );

      console.log(`${socket.id} left the room: ${room}`);
    }
  });
});

const port = process.env.PORT || 80;
server.listen(port, console.log(`Listening on port ${port}...`));
