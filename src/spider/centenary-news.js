// spider centenary news articles

const TurndownService = require('turndown')
const outputPage = require('../output_page.js')
const pageCache = require('../page_cache.js')
// const SHA256 = require("crypto-js/sha256")

var pages = {} // keep a list of loaded pages so we don't repeat same URL (from cache)

module.exports = function requestHandler(doc) {
  if (!doc.url) return
    
  pageCache.put(doc)  
  const spider = this 
  const turndownService = new TurndownService({headingStyle: 'atx'}) 
  var outputFolder = 'output/centenary/'
  var host = 'https://centenary.bahai.us' 
  var outputFile = outputFolder + doc.url.replace(/^https:\/\/centenary.bahai.us\/news\/(.*?)$/m, '$1') + '.md'

  var meta = {}
  meta.url = doc.url 
  meta.title = doc.$('h1.title').text()
  meta.audio = host + doc.$('.node.build-mode-full .field-field-audio audio').attr('src')
  meta.image = host + doc.$('.node.build-mode-full .field-field-clip-img img').attr('src')
    .replace('secondary-images', 'main-image')
  meta.source = doc.$('.node.build-mode-full .field-field-pubname').text().trim()
  meta.date = doc.$('.node.build-mode-full .field-field-historical-date').text().trim()
  meta.location = doc.$('.node.build-mode-full .location .adr').text().trim()
  meta.doctype = 'website'
  meta.status = 'search-only'
  meta.encumbered = false
  meta.collection = 'Centenary News'
  meta.collectionImage = 'https://centenary.bahai.us/sites/default/files/imagecache/theme-image/main_image/abdulbaha-overview-small_0.jpg'
  meta.copyright = '© 2011 National Spiritual Assembly of the Bahá’ís of the United States' 
  
  var htmltext = doc.$('.node.build-mode-full .node-body').html() 
  var markdown = '# ' + meta.title +' {.title}\n\n'
    + meta.source +'  \n'
    + meta.date +'  \n'
    + meta.location +'\n{.noid}  \n\n\n\n'  
    + turndownService.turndown(htmltext)
   
  outputPage(outputFolder, outputFile, meta, markdown)
   
  // uses cheerio, check its docs for more info 
  doc.$('a[href*="/news/"]').each(function(i, elem) {
    // do stuff with element 
    var href = doc.$(elem).attr('href').split('#')[0]
    var url = doc.resolve(href) 
    if (!pages.hasOwnProperty(url)) {
      pages[url] = 1 // save a reference to this page so we don't try to load it again
      pageCache.get(url).then(cacheDoc => {
        if (cacheDoc) {
          console.log('Resolved URL from local cache: ', url)
          requestHandler(cacheDoc)
        } else spider.queue(url, requestHandler);
      })  
    } // else console.log('Skipped already loaded page', url)
  })
}
 

 
