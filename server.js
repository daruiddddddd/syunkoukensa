const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let annotations = []; // メモリ上の注釈記録

io.on('connection', (socket) => {
  console.log('新しい接続:', socket.id);

  // 初期データ送信
  socket.emit('all-annotations', annotations);

  // 新しい注釈
  socket.on('new-annotation', (data) => {
    annotations.push(data);
    socket.broadcast.emit('new-annotation', data);
  });

  // 注釈削除（IPベース）
  socket.on('remove-annotation', (fromIP) => {
    const idx = annotations.map(a => a.ip).lastIndexOf(fromIP);
    if (idx >= 0) {
      annotations.splice(idx, 1);
      io.emit('remove-annotation', fromIP);
    }
  });

  // 再送信要求
  socket.on('get-all', () => {
    socket.emit('all-annotations', annotations);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
