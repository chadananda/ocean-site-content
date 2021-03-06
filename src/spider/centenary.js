// spider centenary news articles
const c = require('../common');
const Collection = require('../collection')

module.exports = new Collection({
  name: "centenary",
  title: "Centenary News",
  url: "https://centenary.bahai.us/news",
  mask: "https://centenary.bahai.us/news/",
  archive: true,
  handler: function(doc) {
    if (doc.url.match(/^https:\/\/centenary\.bahai\.us\/news\d*$/)) {
      // For index pages
      c.processLinks(doc, doc.$('.view-Pictures .views-field-title a'), this.name)
      c.processLinks(doc, doc.$('.view-Pictures ul.pager li.pager-next a'), this.name)
      this.deIndexUrl(doc.url)
    }
    else if (doc.url.match(/^https:\/\/centenary\.bahai\.us\/news\/.+/)) {
  
      let host = 'https://centenary.bahai.us'
  
      // Set meta variable
      let meta = {}
      meta.url = doc.url 
      meta.title = doc.$('h1.title').text()
      meta.audio = host + doc.$('.node.build-mode-full .field-field-audio audio').attr('src') || ""
      meta.image = host + (doc.$('.node.build-mode-full .field-field-clip-img img').attr('src') || "")
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
      c.outputPage(this.name, markdown, meta)

      // Process next/prev links in document
      c.processLinks(doc, doc.$('#content a[href^="/news/"]'), this.name)

    }
  },
})

