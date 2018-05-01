const fs = require('fs')
const sh = require('shelljs')
const mkdirp = require('mkdirp')

/**
 * Initialize collections with the following configuration settings:
 * name: machine name of the collection (required)
 * url: url on which to begin crawling (required)
 * title: human readable name of the collection (default: name)
 * mask: mask to remove from urls on file save (default: url)
 * folder: the folder name, beneath output, in which to save files (default: name)
 * index: whether to write the index file after crawling (default: true)
 * archive: whether to skip running the spider unless requested specifically (default: false)
 * handler(doc): function that writes the document
 * writeIndex(): function that writes the index file
 * @param {object} conf
 */
class Collection {
  constructor(conf) {
    if (!conf.name || !conf.url) {
      throw new Error("Collection cannot be created without a name and url")
    }

    // Set defaults
    this.title = conf.name
    this.mask = conf.url
    this.folder = 'output/' + (conf.folder || conf.name) + '/'
    this.index = true
    this.archive = false

    if (this.folder.match(/\.\./)) {
      throw new Error('Folder name cannot have ".." (' + this.folder + ')')
    }

    mkdirp(this.folder, (err) => {
      if (err) throw new Error('Could not make folder ' + this.folder)
    })

    Object.keys(conf).map(k => {
      switch (k) {
        case 'folder':
          break
        default:
          this[k] = conf[k]
      }
    })

    this._index = {}

  }
}

Collection.prototype.handler = function(doc) {
  console.log('Generic request handler for ' + this.name + ' called for ' + doc.url)
}

Collection.prototype.writeIndex = function() {
  if (this.index && Object.getOwnPropertyNames(this._index).length) {
    let index = Object.keys(this._index).map(key => {
      return this._index[key] === 'saved' ? `${key}.md` : `${key} (${this._index[key]})`
    }).sort().join('\n') + '\n'
    fs.writeFileSync(this.folder + '.index.txt', index, 'UTF-8')
    console.log(`Wrote index for collection ${this.name}`)
  }
}

Collection.prototype.indexUrl = function(url, status) {
  this._index[url.replace(this.mask, '')] = status
}

Collection.prototype.deIndexUrl = function(url, status) {
  delete this._index[url.replace(this.mask, '')]
}

module.exports = Collection