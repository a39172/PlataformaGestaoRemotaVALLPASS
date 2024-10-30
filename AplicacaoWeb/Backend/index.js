const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const endpoints = require("./endpoints");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: "/backend",
  cors: { origin: "*" },
});

app.use(express.json());
app.use(cors());
app.set("io", io);
app.use("/", endpoints);

io.on("connection", (socket) => {
  if (socket.handshake.auth.token == process.env.AccessToken) {
    const roomName = socket.handshake.query.roomName;
    socket.join(roomName);
  }
});

server.listen(49153, () => {
  console.log("listening on 49153");
});
