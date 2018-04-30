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
    if (!this.singlePage && !this.pages.hasOwnProperty(url)) {
      if (singlePage) this.singlePage = true
      // TODO: allow for skipped urls
      // TODO: ensure that each URL is only processed once per run
      this.pageCache.get(url).then(cacheDoc => {
        if (cacheDoc) {
          console.log('Resolved URL from local cache: ', url)
          this.pages[url] = true
          this.collections[collectionName].handler(cacheDoc)
        } else this.spider.queue(url, function(doc) {
          if (!doc.url) return
          this.pageCache.put(doc)
          this.collections[collectionName].handler.call(this, doc)
        }.bind(this));
      }).catch(error => {
        console.error(error)
      })
    }
  },
  outputPage: function(collection, markdown, meta = false, filename = false) {
    let outputFolder = (this.collections[collection].hasOwnProperty('folder') ? this.collections[collection].folder : 'output/' + collection + '/')
    let outputFile = (filename ? filename.replace(outputFolder, '') : meta.url.replace(this.collections[collection].mask, '') + '.md')
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
    mkdirp(outputFolder, function (err) {
      if (err) console.error(err)
      else {
        fs.writeFileSync(outputFolder + outputFile, header + markdown, 'UTF-8')
        console.log('Saved file:  ' + outputFolder + outputFile)
      }
    })
  }
}
