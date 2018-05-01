const Spider = require('node-spider')
const TurndownService = require('turndown')
const pageCache = require('./page_cache.js')
const fs = require('fs')
const mkdirp = require('mkdirp')

module.exports = {
  pages: {},
  collections: {},
  pageCache: pageCache,
  singlePage: false,
  turndown: new TurndownService({headingStyle: 'atx'}),
  md: function(arg, ...args) {
    return this.turndown.turndown(arg)
  },
  spider: new Spider({
    // How many requests can be run in parallel 
    concurrent: 5,
    // How long to wait after each request 
    delay: 0,
    // A stream to where internal logs are sent, optional 
    logs: process.stderr,
    // Re-visit visited URLs, false by default 
    allowDuplicates: false,
    // If `true` all queued handlers will be try-catch'd, errors go to `error` callback 
    catchErrors: true,
    // If `true` the spider will set the Referer header automatically on subsequent requests 
    addReferrer: false,
    // If `true` adds the X-Requested-With:XMLHttpRequest header 
    xhr: false,
    // If `true` adds the Connection:keep-alive header and forever option on request module 
    keepAlive: false,
    // Called when there's an error, throw will be used if none is provided 
    error: function(err, url) {
    },
    // Called when there are no more requests 
    done: function() {
    },
 
    //- All options are passed to `request` module, for example: 
    headers: { 'user-agent': 'node-spider' },
    encoding: 'utf8'
  }),
  processLinks: function (doc, elements, collectionName) {
    if (!this.singlePage) {
      elements.each((i, elem) => {
        var href = doc.$(elem).attr('href').split('#')[0]
        var url = doc.resolve(href)
        this.processUrl(url, collectionName)
      })
    }
  },
  processUrl: function (url, collectionName, singlePage = false) {
    if (this.pages.hasOwnProperty(url)) {
      console.log('Ignored duplicate URL: ', url)
    }
    else if (!this.singlePage) {
      let collection = this.collections[collectionName]
      if (singlePage) this.singlePage = true
      // TODO: allow for skipped urls
      this.pageCache.get(url).then(cacheDoc => {
        this.pages[url] = collectionName
        if (cacheDoc) {
          console.log('Resolved URL from local cache: ', url)
          collection.indexUrl(url, 'resolved from cache')
          collection.handler(cacheDoc)
        } 
        else {
          console.log('Queued URL: ', url)
          collection.indexUrl(url, 'queued in spider')
          this.spider.queue(url, function(doc) {
            if (!doc.url) return
            this.pageCache.put(doc)
            collection.handler(doc)
          }.bind(this));
        }
      }).catch(error => {
        console.error(error)
      })
    }
  },
  outputPage: function(collectionName, markdown, meta = false, filename = false) {
    let collection = this.collections[collectionName]
    let outputFile = (filename ? filename.replace(collection.folder, '') : meta.url.replace(collection.mask, '') + '.md')
    var header = (meta ? // May use "false" as meta to output a simple file
      [].concat(['---'], Object.keys(meta).map((key) => {
      if ((!!meta[key]) && (meta[key].constructor === Array)) {
        return (meta[key].length > 1 ? Array(key + ':', ...meta[key]).join('\n  - ') : `${key}: ${meta[key][0]}`)
      }
      else {
        return `${key}: ${meta[key]}`
      }
    }), ['---\n\n\n']).join('\n') 
    : '')
    // output with forced directory
    mkdirp(collection.folder, (err) => {
      if (err) console.error(err)
      else {
        try {
          fs.writeFileSync(collection.folder + outputFile, header + markdown, 'UTF-8')
          collection.indexUrl(meta.url, 'saved')
          console.log('Saved file: ' + collection.folder + outputFile)
        }
        catch(err) {
          console.error(err)
        }
      }
    })
  },
  writeIndex(collectionName) {
    let collection = this.collections[collectionName]
    if (collection.hasOwnProperty('indexCache') && collection.indexCache.length) {
      let index = Object.keys(collection.indexCache).map(key => {
        return collection.indexCache[key] === 'saved' ? key : key + ' ' + collection.indexCache[key]
      }).join('\n')
      collection.writeIndex()
    }
  }
}
