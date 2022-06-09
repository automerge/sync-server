import * as fs from 'fs'

function fileName(docId) {
  return `${docId}.amrg`;
}

function NodeFSStorageAdapter() {
  return {
    load: (docId) => {
      return new Promise((resolve, reject) => {
        fs.readFile(fileName(docId), (err, data) => {
          if (err) reject(err); else resolve(data)
        });
      });
    },

    save: (docId, binary) => {
      fs.writeFile(fileName(docId), binary, err => {
        if (err) throw err;
      });
    },

    remove: (docId) => {
      fs.rm(fileName(docId), err => {
        if (err) throw err;
      });
    }
  }
}

export default NodeFSStorageAdapter
