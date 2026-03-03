require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameSocket = require("./socket/gameSocket");
const { access } = require('fs');

const app = express();
const PORT = process.env.PORT ; 

app.use(cors());  
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Reaction Battle Server Running 🚀");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://reaction-battle-master-client.vercel.app"
    ],
    methods: ["GET", "POST"]
  },
});

gameSocket(io);


server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});