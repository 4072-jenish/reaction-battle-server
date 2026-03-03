let rooms = {};

function startRound(io, roomId) {
  const room = rooms[roomId];
  console.log(room);
  
  if (!room) return;

  room.gameStarted = false;
  room.startTime = null;

  io.to(roomId).emit("startCountdown");

  const delay = Math.floor(Math.random() * 3000) + 2000;

  setTimeout(() => {
    if (!rooms[roomId]) return; // room might be deleted

    room.gameStarted = true;
    room.startTime = Date.now();

    io.to(roomId).emit("go");
  }, delay);
}

function gameSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // CREATE ROOM
    socket.on("createRoom", () => {
      const roomId = Math.random().toString(36).substring(2, 7);

      rooms[roomId] = {
        players: [socket.id],
        gameStarted: false,
        startTime: null,
      };

      socket.join(roomId);
      socket.emit("roomCreated", roomId);
    });

    // JOIN ROOM
    socket.on("joinRoom", (roomId) => {
      const room = rooms[roomId];
    
      if (!room) return;
    
      if (!room.players.includes(socket.id)) {
        room.players.push(socket.id);
        socket.join(roomId);
      }
    
      console.log("Players in room:", room.players);
    
      if (room.players.length === 2) {
        startRound(io, roomId);
      }
    });

    // CLICK EVENT
    socket.on("clicked", (roomId) => {
      const room = rooms[roomId];

      if (!room || !room.gameStarted) return;

      const reactionTime = Date.now() - room.startTime;
      room.gameStarted = false;

      io.to(roomId).emit("gameOver", {
        winner: socket.id,
        time: reactionTime,
      });
    });

    // RESET GAME
    socket.on("resetGame", (roomId) => {  
      console.log("Reset requested for:", roomId);
      console.log("Existing rooms:", Object.keys(rooms));
      startRound(io, roomId); 
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (let roomId in rooms) {
        rooms[roomId].players = rooms[roomId].players.filter(
          (id) => id !== socket.id
        );

        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
}

module.exports = gameSocket;