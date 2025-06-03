
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let annotations = [];
let floorImages = {};
let ipOrder = [];

io.on('connection', (socket) => {
  console.log('接続:', socket.id);

  socket.emit('all-annotations', annotations);
  socket.emit('all-floor-images', floorImages);

  socket.on('new-annotation', (data) => {
    annotations.push(data);
    if (!ipOrder.includes(data.ip)) ipOrder.push(data.ip);
    socket.broadcast.emit('new-annotation', data);
  });

  socket.on('remove-annotation', ({ ip, floor }) => {
    const idx = annotations.map(a => a.ip).lastIndexOf(ip);
    if (idx >= 0) {
      annotations.splice(idx, 1);
      io.emit('remove-annotation', { ip, floor });
    }
  });

  socket.on('floor-image', ({ floor, src }) => {
    floorImages[floor] = src;
    socket.broadcast.emit('floor-image', { floor, src });
  });

  socket.on('get-all', () => {
    socket.emit('all-annotations', annotations);
    socket.emit('all-floor-images', floorImages);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
