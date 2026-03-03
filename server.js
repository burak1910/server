const io =
    require('socket.io')(process.env.PORT || 3000, {cors: {origin: '*'}});

io.on('connection', (socket) => {
  console.log('Yeni cihaz bağlandı:', socket.id);

  socket.on('message', (data) => {
    socket.broadcast.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Cihaz ayrıldı:', socket.id);
  });
});