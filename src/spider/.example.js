// spider resources
var c = require('../common')

module.exports = function requestHandler(doc) {
  // Don't do anything if there is no url
  if (!doc.url) return
    
  // Use the page cache if possible
  c.pageCache.put(doc)

  // Set basic variables
  var outputFolder = 'output/[folder]/'
  var host = 'https://example.com'
  var outputFile = outputFolder + doc.url.replace(/^https?:\/\/example\.com\/(.*?)$/m, '$1') + '.md'

  // Set up the meta information
  // Meta may include the following:
  var meta = {
    // url: doc.url,        // the url of the document
    // language: 'en',      // set this if the document is a different language
    // title: '',           // the title of the document, e.g. doc.$('title')
    // audio: '',           // url to the audio file, e.g. doc.$('audio').attr('src')
    // image: '',           // url to a representative image, if available
    // source: '',          // the original publication
    // date: '',            // date when the content was originally created
    // location: '',        // the location of the content, for news items and the like
    doctype: 'website',     // should always be 'website' for crawled documents
    status: 'search-only',  // should always be 'search-only' for crawled documents
    encumbered: false,      // whether app user is prevented from scrolling (should always be false for website doctype)
    // collection: '',      // the name of the collection
    // collectionImage: '', // an image representative of the entire collection
    // copyright: '',       // the copyright information from the crawled page
  }
  
  // Get the main content of the page
  var htmltext = c.turndown.turndown(doc.$('body').html())
  
  // Set up the markdown content
  var markdown = '# ' + meta.title +' {.title}\n\n'
    + meta.source +'  \n'
    + meta.date +'  \n'
    + meta.location +'\n{.noid}  \n\n\n\n'
    + htmltext
  
  // Write the page to disk
  c.output_page(outputFolder, outputFile, meta, markdown)
  
  // Queue the next links
  c.processLinks(doc, doc.$('a[href^="/example"]'),requestHandler);
  
}
 

 
