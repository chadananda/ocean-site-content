// spider centenary news articles
const c = require('../common');

module.exports = function requestHandler(doc) {
  // Set whatever variables may be useful
  let outputFolder = 'output/centenary/'
  let host = 'https://centenary.bahai.us' 
  let outputFile = outputFolder + doc.url.replace(/^https:\/\/centenary.bahai.us\/news\/(.*?)$/m, '$1') + '.md'

  // Set meta variable
  let meta = {}
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
  
  // Set up html text
  let htmltext = doc.$('.node.build-mode-full .node-body').html()
  let markdown = '# ' + meta.title +' {.title}\n\n'
    + meta.source +'  \n'
    + meta.date +'  \n'
    + meta.location +'\n{.noid}  \n\n\n\n'
    + c.turndown.turndown(htmltext)
   
  // Output the page
  c.outputPage(outputFolder, outputFile, meta, markdown)
   
  // Process all links in the page (using cheerio to parse html)
  c.processLinks(doc, doc.$('a[href*="/news/"]'), requestHandler)
}
