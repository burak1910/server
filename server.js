const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(
    server, {cors: {origin: '*'}, transports: ['websocket', 'polling']});

// Tarayıcıdan girince 404 almanı engelleyen satır:
app.get('/', (req, res) => {
  res.send(
      '<h1>🚀 Robot Sinyalleşme Sunucusu Canlı!</h1><p>Socket.io dinleniyor...</p>');
});

io.on('connection', (socket) => {
  console.log('✅ Bir cihaz bağlandı:', socket.id);

  socket.on('new_user', (data) => {
    console.log('📱 Flutter kullanıcı sinyali:', data);
    socket.broadcast.emit('new_user', data);
  });

  socket.on('message', (data) => {
    socket.broadcast.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cihaz ayrıldı:', socket.id);
  });
});

// Render'ın istediği portu dinamik olarak al
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu ${PORT} portunda tıkır tıkır çalışıyor...`);
});