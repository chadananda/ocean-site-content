// spider resources
var c = require('../common')

module.exports = {
  name: "example",                  // Internal name of the collection; must be unique
  title: "Example Content",         // Human readable title; may be used for meta collection
  url: "https://example.com",       // URL to begin crawling
  mask: "https://example.com/",     // Mask to remove from urls on file save
  folder: "output/example/",        // (optional) Folder in which to save files. Defaults to output/[name]/
  index: true,                      // Whether to keep an index of urls crawled or attempted, to highlight errors
  archive: false,                   // Whether to skip this collection when running all spiders
}

module.exports.handler = function requestHandler(doc) {
  let info = module.exports

  // Set up the meta information
  // Meta may include the following:
  let meta = {
    // url: doc.url,        // the url of the document
    // language: '',        // set if the document is not in English, or if you KNOW it is in English
    // title: '',           // the title of the document, e.g. doc.$('title')
    // audio: '',           // url to the audio file, e.g. doc.$('audio').attr('src')
    // image: '',           // url to a representative image, if available
    // source: '',          // the original publication
    // date: '',            // date when the content was originally created
    // location: '',        // the location of the content, for news items and the like
    doctype: 'website',     // should always be 'website' for crawled documents
    status: 'search-only',  // should always be 'search-only' for crawled documents
    encumbered: false,      // whether app user is prevented from scrolling (should always be false for website doctype)
    collection: info.title, // the name of the collection
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
  c.output_page(info.name, markdown, meta)
  
  // Queue the next links
  c.processLinks(doc, doc.$('a[href^="/example"]'), requestHandler);
  
}
