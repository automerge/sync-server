import express from 'express'
import { WebSocketServer } from 'ws'

const PORT = 3000;
let sockets = [];

const wsServer = new WebSocketServer({ noServer: true });
wsServer.on('connection', socket => {
  console.log('New WebSocket connection');
  sockets.push(socket);

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    console.log('Disconnected');
    sockets = sockets.filter(s => s !== socket);
  });

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
