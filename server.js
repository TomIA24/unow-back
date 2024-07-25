require("dotenv").config();
const express = require("express");
//const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
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
const newsletter = require("./routes/newsletterControle");
const evaluationsRoutes = require("./routes/EvaluationsControle");
const CategoryRoutes = require("./routes/CategoryControle");
const quizRoutes=require("./routes/QuizControle");
// const upload = require("./routes/Ressources");
const upload = require('./routes/file-upload-routes');
const download = require('./routes/file-download-routes');

const https = require("https")
const http = require("http")
const fs = require("fs");
var xss = require("xss")

const app = express();

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

app.use(cors({ origin: "*" }))

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

app.use("/api/notifications", notificationsRoutes);
app.use("/api/Room", Room);
app.use("/api/upload", upload.routes);
app.use("/api/download", download.routes);

var server = http.createServer(app);

// var server = http.createServer(app)

var io = require("socket.io")(server, {
    cors: {
        origin: "*"
    },
});






sanitizeString = (str) => {
    return xss(str)
}

connections = {}
messages = {}
timeOnline = {}

io.on('connection', (socket) => {

    socket.on('join-call', (path) => {
        if (connections[path] === undefined) {
            connections[path] = []
        }
        connections[path].push(socket.id)

        timeOnline[socket.id] = new Date()

        for (let a = 0; a < connections[path].length; ++a) {
            io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
        }

        if (messages[path] !== undefined) {
            for (let a = 0; a < messages[path].length; ++a) {
                io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                    messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
            }
        }

        console.log(path, connections[path])
    })

    socket.on('signal', (toId, message) => {
        io.to(toId).emit('signal', socket.id, message)
    })

    socket.on('chat-message', (data, sender) => {
        data = sanitizeString(data)
        sender = sanitizeString(sender)

        var key
        var ok = false
        for (const [k, v] of Object.entries(connections)) {
            for (let a = 0; a < v.length; ++a) {
                if (v[a] === socket.id) {
                    key = k
                    ok = true
                }
            }
        }

        if (ok === true) {
            if (messages[key] === undefined) {
                messages[key] = []
            }
            messages[key].push({ "sender": sender, "data": data, "socket-id-sender": socket.id })
            console.log("message", key, ":", sender, data)

            for (let a = 0; a < connections[key].length; ++a) {
                io.to(connections[key][a]).emit("chat-message", data, sender, socket.id)
            }
        }
    })

    socket.on('disconnect', () => {
        var diffTime = Math.abs(timeOnline[socket.id] - new Date())
        var key
        for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
            for (let a = 0; a < v.length; ++a) {
                if (v[a] === socket.id) {
                    key = k

                    for (let a = 0; a < connections[key].length; ++a) {
                        io.to(connections[key][a]).emit("user-left", socket.id)
                    }

                    var index = connections[key].indexOf(socket.id)
                    connections[key].splice(index, 1)

                    console.log(key, socket.id, Math.ceil(diffTime / 1000))

                    if (connections[key].length === 0) {
                        delete connections[key]
                    }
                }
            }
        }
    })
})




const port = process.env.PORT || 8080;
server.listen(port, console.log(`Listening on port ${port}...`));