// spider news-articles from bahai-library.com
let c = require('../common')
const bl = require('../helpers/bahai-library')

module.exports = {
  name: "bl-news-articles",
  url: "https://bahai-library.com/Newspapers",
  mask: "https://bahai-library.com/",
  index: true,
}

module.exports.handler  = function requestHandler(doc) {
  
  let outputFile = doc.url.replace(this.mask, '') + '.md'

  if (doc.url.match(/^https:\/\/bahai-library\.com\/Newspapers.*/)) {
    // For index pages
    c.processLinks(doc, doc.$('td.content ol li>a:first-child'), requestHandler)
    c.processLinks(doc, doc.$('a[href^="/Newspapers/"]'), requestHandler)
  }
  else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
    c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), requestHandler)
  }
  else {
    let docMeta = bl.getDocMeta(doc)
    let docContent = bl.getDocContent(doc)

    // Set up the meta information
    // Meta may include the following:
    let meta = {
      url: doc.url, // the url of the document
      title: bl.getTitle(docMeta) || doc.$('title').text(), // the title of the document, e.g. doc.$('title')
      audio: bl.getAudio(docContent), // url to the audio file, e.g. doc.$('audio').attr('src')
      author: bl.getAuthor(docMeta), // name of the author,
      image: bl.getImage(docContent), // url to a representative image, if available
      source: bl.getSource(docMeta), // the original publication
      date: bl.getYear(docMeta), // date when the content was originally created
      doctype: 'website', // should always be 'website'
      status: 'search-only', // should always be 'search-only'
      encumbered: false, // whether app user is prevented from scrolling (should always be false for website doctype)
      collection: 'News Articles (bahai-library.com)', // ?
      // collectionImage: '', // an image representative of the collection
      // copyright: '', // the copyright information from the spidered site
    }

    // Set up the markdown content
    let markdown = bl.getMarkdown(docMeta) + "\n\n\n" + bl.getMainContentMarkdown(docContent)
    
    // Write the page to disk
    c.outputPage(this.name, markdown, meta)
    if (bl.getTextLength(docContent) < 100) {
      c.outputPage(this.name, markdown, meta, '.' + outputFile)
    }
  }
}.bind(module.exports)
