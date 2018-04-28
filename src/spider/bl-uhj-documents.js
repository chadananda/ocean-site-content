// spider biographies from bahai-library.com
let c = require('../common')
const bl = require('../helpers/bahai-library')

module.exports = {
  name: "bl-uhj-documents",
  title: "Universal House of Justice Documents (bahai-library.com)",
  url: "https://bahai-library.com/UHJ-documents",
  mask: "https://bahai-library.com/",
  index: true,
}

module.exports = function requestHandler(doc) {
  let info = module.exports

  if (doc.url.match(/^https:\/\/bahai-library\.com\/UHJ-documents.*/)) {
    // For index pages
    c.processLinks(doc, doc.$('td.content ol li>a:first-child'), requestHandler)
    c.processLinks(doc, doc.$('a[href^="/UHJ-documents/"]'), requestHandler)
  }
  else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
    c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), requestHandler)
  }
  else {
    let f = bl.parseDocument(doc)
    f.meta.collection = info.title
    // f.meta.collectionImage: '', // an image representative of the collection
    // f.meta.copyright: '', // the copyright information from the spidered site

    bl.outputPage(info, f)
  }
}
