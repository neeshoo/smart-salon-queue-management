let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join salon-specific real-time room
    socket.on('join:salon', (salonId) => {
      if (salonId) {
        socket.join(`salon:${salonId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined salon:${salonId}`);
      }
    });

    // Leave salon room
    socket.on('leave:salon', (salonId) => {
      if (salonId) {
        socket.leave(`salon:${salonId}`);
        console.log(`[Socket.io] Socket ${socket.id} left salon:${salonId}`);
      }
    });

    // Join personal user room for direct notifications & Leave Now alerts
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  return ioInstance;
};

// Helper to broadcast salon queue updates to all clients in that salon
const broadcastQueueUpdate = (salonId, data) => {
  if (ioInstance) {
    ioInstance.to(`salon:${salonId}`).emit('queue:update', data);
  }
};

// Helper to notify a specific user
const notifyUser = (userId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  broadcastQueueUpdate,
  notifyUser,
};
