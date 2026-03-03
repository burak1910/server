const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Robot Sunucusu Aktif! 🚀');
});
const io = require('socket.io')(server, {cors: {origin: '*'}});

io.on('connection', (socket) => {
  console.log('Yeni cihaz bağlandı:', socket.id);

  // Yeni biri bağlandığında herkese "yeni birisi geldi" haberi uçur
  socket.broadcast.emit('new_user', {id: socket.id});

  socket.on('message', (data) => {
    socket.broadcast.emit('message', data);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda.`));