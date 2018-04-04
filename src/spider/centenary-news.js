// spider centenary news articles

const TurndownService = require('turndown')
const output_page = require('../output_page.js')
 


module.exports = function requestHandler(doc) {
  const parentSpiderObj = this 
    
  const turndownService = new TurndownService() 
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
   
  output_page(outputFolder, outputFile, meta, markdown)
   
  // uses cheerio, check its docs for more info 
  doc.$('a[href*="/news/"]').each(function(i, elem) {
      // do stuff with element 
      var href = doc.$(elem).attr('href').split('#')[0]
      var url = doc.resolve(href)
      parentSpiderObj.queue(url, requestHandler);
  })
}
 

 
