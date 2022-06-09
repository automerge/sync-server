import express from 'express'
import ServerRepo from './ServerRepo.js'

const PORT = 3000;
const serverRepo = new ServerRepo();
const app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World')
})

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  serverRepo.server.handleUpgrade(request, socket, head, socket => {
    serverRepo.server.emit('connection', socket, request);
  });
});
