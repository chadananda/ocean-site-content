// spider biographies from bahai-library.com
let c = require('../common')
let BLCollection = require('../helpers/bahai-library')

module.exports = new BLCollection({
  name: "bl-biographies",
  title: "Biographies (bahai-library.com)",
  url: "https://bahai-library.com/Biographies",
  handler: function(doc) {  
    if (doc.url.match(/^https:\/\/bahai-library\.com\/Biographies.*/)) {
      // For index pages
      c.processLinks(doc, doc.$('td.content ol li>a:first-child'), this.name)
      c.processLinks(doc, doc.$('a[href^="/Biographies/"]'), this.name)
      this.deIndexUrl(doc.url)
    }
    else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
      c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), this.name)
      this.deIndexUrl(doc.url)
    }
    else {
      let docObject = this.parseDocument(doc)
      docObject.meta.collection = this.title
      // blDoc.meta.collectionImage: '', // an image representative of the collection
      // blDoc.meta.copyright: '', // the copyright information from the spidered site
  
      this.outputPage(docObject)
    }
  },
})

