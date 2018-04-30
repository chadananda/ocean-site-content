// spider theses from bahai-library.com
let c = require('../common')
const bl = require('../helpers/bahai-library')

module.exports = {
  name: "bl-theses",
  title: "Theses (bahai-library.com)",
  url: "https://bahai-library.com/Theses",
  mask: "https://bahai-library.com/",
  index: true,
}

module.exports.handler = function requestHandler(doc) {
  let info = module.exports
  
  if (doc.url.match(/^https:\/\/bahai-library\.com\/Theses.*/)) {
    // For index pages
    c.processLinks(doc, doc.$('td.content ol li>a:first-child'), info.name)
    c.processLinks(doc, doc.$('a[href^="/Theses/"]'), info.name)
  }
  else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
    c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), info.name)
  }
  else {
    let f = bl.parseDocument(doc)
    f.meta.collection = info.title
    // f.meta.collectionImage: '', // an image representative of the collection
    // f.meta.copyright: '', // the copyright information from the spidered site

    bl.outputPage(info, f)
  }
}
