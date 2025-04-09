// socketHandler.js
const joinRoomHandlers = (io, socket, data) => {
    const { roomId } = data;
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.join(roomId);
    
    // Beritahu semua orang di room bahwa pengguna baru bergabung
    io.to(roomId).emit('user-joined', {
      userId: socket.id,
      message: 'User baru bergabung ke room'
    });
  };
  
  const caseMessageHandlers = (io, socket, data) => {
    const { roomId, message, sender } = data;
    console.log(`New message in room ${roomId}: ${message}`);
    
    // Broadcast pesan ke semua client di room
    io.to(roomId).emit('new-message', {
      sender,
      message,
      timestamp: new Date()
    });
  };
  
  const disconnectHandlers = (io, socket) => {
    console.log(`Client ${socket.id} disconnected`);
    // Tambahkan logika lain yang diperlukan saat user disconnect
  };
  
  module.exports = {
    joinRoomHandlers,
    caseMessageHandlers,
    disconnectHandlers
  };