const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server, {cors: {origin: '*'}});

// Portu Render'ın verdiği porttan al
const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('Cihaz bağlandı:', socket.id);
  socket.on('message', (data) => {
    socket.broadcast.emit('message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});