import Automerge from 'automerge'
import { Repo, Network, StorageSubsystem, DependencyCollectionSynchronizer } from 'automerge-repo'
import NodeFSStorageAdapter from './NodeFSStorageAdapter.js'
import NodeWSServerAdapter from './NodeWSServerAdapter.js'

export default function ServerRepo(config) {
  const filesystem = new NodeFSStorageAdapter(config)
  const webSocketServer = new NodeWSServerAdapter(config)
  const storageSubsystem = new StorageSubsystem(filesystem)
  const repo = new Repo(storageSubsystem)

  repo.on('document', ({ handle }) =>
    handle.on('change', ({ documentId, doc, changes }) => {
      storageSubsystem.save(documentId, doc, changes)
      console.log('updated doc', doc)
    })
  )

  const networkSubsystem = new Network([webSocketServer])
  const synchronizer = new DependencyCollectionSynchronizer(repo)

  // wire up the dependency synchronizer
  networkSubsystem.on('peer', ({ peerId }) => synchronizer.addPeer(peerId))
  repo.on('document', ({ handle }) => synchronizer.addDocument(handle.documentId))
  networkSubsystem.on('message', ({ peerId, message }) => {
    synchronizer.onSyncMessage(peerId, message)
  })
  synchronizer.on('message', ({ peerId, message }) => {
    networkSubsystem.onMessage(peerId, message)
  })

  networkSubsystem.join('sync_channel')

  repo.server = webSocketServer.server
  return repo
}
