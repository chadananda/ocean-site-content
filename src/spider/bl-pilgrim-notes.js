// spider pilgrim-notes from bahai-library.com
let c = require('../common')
const bl = require('../helpers/bahai-library')

module.exports = {
  name: "bl-pilgrim-notes",
  title: "Pilgrim Notes (bahai-library.com)",
  url: "https://bahai-library.com/Pilgrims",
  mask: "https://bahai-library.com/",
  index: true,
}

module.exports.handler = function requestHandler(doc) {
  let info = module.exports

  if (doc.url.match(/^https:\/\/bahai-library\.com\/Pilgrims.*/)) {
    // For index pages
    c.processLinks(doc, doc.$('td.content ol li>a:first-child'), info.name)
    c.processLinks(doc, doc.$('a[href^="/Pilgrims/"]'), info.name)
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
