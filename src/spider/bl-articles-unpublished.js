// spider unpublished-articles from bahai-library.com
let c = require('../common')
const BLCollection = require('../helpers/bahai-library')

module.exports = new BLCollection ({
  name: "bl-articles-unpublished",
  title: "Unpublished Articles (bahai-library.com)",
  url: "https://bahai-library.com/Articles-unpublished",
  handler: function(doc) {
    if (doc.url.match(/^https:\/\/bahai-library\.com\/Articles-unpublished.*/)) {
      // For index pages
      c.processLinks(doc, doc.$('td.content ol li>a:first-child'), this.name)
      c.processLinks(doc, doc.$('a[href^="/Articles-unpublished/"]'), this.name)
      this.deIndexUrl(doc.url)
    }
    else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
      c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), this.name)
    }
    else {
      let f = this.parseDocument(doc)
      blDoc.meta.collection = this.title
      // blDoc.meta.collectionImage: '', // an image representative of the collection
      // blDoc.meta.copyright: '', // the copyright information from the spidered site

      this.outputPage(blDoc)
    }
  }
})
