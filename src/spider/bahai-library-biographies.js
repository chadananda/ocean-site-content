// spider biographies from bahai-library.com
let c = require('../common')
const bl = require('../helpers/bahai-library')

module.exports = function requestHandler(doc) {
  // Don't do anything if there is no url
  if (!doc.url) return
    
  // Use the page cache if possible
  c.pageCache.put(doc)

  // Set basic variables
  var outputFolder = 'output/biographies/'
  var host = 'https://bahai-library.com'
  var outputFile = outputFolder + doc.url.replace(/^https?:\/\/bahai-library.com\/(.*?)$/m, '$1') + '.md'

  if (doc.url.match(/^https:\/\/bahai-library\.com\/Biographies.*/)) {
    // For index pages
    c.processLinks(doc, doc.$('td.content ol li>a:first-child'), requestHandler)
    c.processLinks(doc, doc.$('a[href^="/Biographies/"]'), requestHandler)
  }
  else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
    c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), requestHandler)
  }
  else {
    let docMeta = bl.getDocMeta(doc)
    let docContent = bl.getDocContent(doc)

    // Set up the meta information
    // Meta may include the following:
    var meta = {
      url: doc.url, // the url of the document
      title: bl.getTitle(docMeta) || doc.$('title').text(), // the title of the document, e.g. doc.$('title')
      audio: bl.getAudio(docContent), // url to the audio file, e.g. doc.$('audio').attr('src')
      author: bl.getAuthor(docMeta), // name of the author,
      image: bl.getImage(docContent), // url to a representative image, if available
      source: bl.getSource(docMeta), // the original publication
      date: bl.getYear(docMeta), // date when the content was originally created
      // doctype: '', // ?
      status: 'search-only', // ?
      // encumbered: '', // ?
      collection: 'Biographies (bahai-library.com)', // ?
      // collectionImage: '', // an image representative of the collection
      // copyright: '', // the copyright information from the spidered site
    }
    
    // Get the main content of the page
    let htmlContent = bl.getHtmlContent(docContent)
    
    // Set up the markdown content
    let markdown = c.turndown.turndown(docMeta.html())
      + "\n\n\n"
      + c.turndown.turndown(htmlContent)
    
    // Write the page to disk
    c.outputPage(outputFolder, outputFile, meta, markdown)

  }

}
 

 
