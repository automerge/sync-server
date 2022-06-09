import EventEmitter from 'eventemitter3'
import { WebSocketServer } from 'ws'

class NodeWSServerAdapter extends EventEmitter {
  server
  openSockets = []

  #announceConnection(channel, peerId, socket) {
    // return a peer object
    const connection = {
      close: () => socket.close(),
      isOpen: () => socket.readyState === WebSocket.OPEN,
      send: (uint8message) => {
        const message = uint8message.buffer.slice(
          uint8message.byteOffset,
          uint8message.byteOffset + uint8message.byteLength,
        )
        socket.send(message)
      },
    }
    this.emit('peer-candidate', { peerId, channel, connection })
  }

  connect(peerId) {
    this.peerId = peerId
    this.server = new WebSocketServer({ noServer: true })
    this.server.on('connection', socket => {
      console.log('New WebSocket connection')
      this.openSockets.push(socket)

      // TODO: need to get documentId/channel and username from socket
      let documentId = 'TODO', userName = 'TODO'
      this.#announceConnection(documentId, userName, socket)

      // When a socket closes, or disconnects, remove it from the array.
      socket.on('close', () => {
        console.log('Disconnected')
        this.openSockets = this.openSockets.filter(s => s !== socket)
      })

      socket.on('message', message => {
        console.log('Received message: ', message)
        this.emit('message', { peerId: userName, channel: documentId, message: new Uint8Array(message) })
      })
    })
  }

  join(docId) {
    for (let socket of this.openSockets); // TODO
  }

  leave(docId) {
    for (let socket of this.openSockets); // TODO
  }
}

export default NodeWSServerAdapter

