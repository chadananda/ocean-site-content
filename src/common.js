const Spider = require('node-spider')
const TurndownService = require('turndown')
const pageCache = require('./page_cache.js')
const outputPage = require('./output_page.js')

module.exports = {
  pages: {},
  pageCache: pageCache,
  outputPage: outputPage,
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
  processLinks: function (doc, elements, handler) {
    elements.each((i, elem) => {
      var href = doc.$(elem).attr('href').split('#')[0]
      var url = doc.resolve(href)
      this.processUrl(url, handler)
    })
  },
  processUrl: function (url, handler) {
    if (!this.pages.hasOwnProperty(url)) {
      this.pageCache.get(url).then(cacheDoc => {
        if (cacheDoc) {
          console.log('Resolved URL from local cache: ', url)
          this.pages[url] = true
          handler(cacheDoc)
        } else this.spider.queue(url, handler);
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
