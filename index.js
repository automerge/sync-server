const express = require('express');
const ws = require('ws');

const PORT = 3000;
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => {
    console.log('Received message: ', message)
    socket.send(message);
  });
});

const app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World')
})

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
