const DocConverter = require('../convert')
const c = require('../common')
const cheerio = require('cheerio')

// Order in which various document types are parsed
docTypes = {
  txt: 20,
  TXT: 19,

  pdf: 10,
  PDF: 9,

  doc: 7,
  DOC: 6,
  docx: 5,
  DOCX: 4,

  epub: 3,
  EPUB: 2,
  mobi: 1,
  MOBI: 0,

  html: -1000,
  '': -1000,
}

/**
 * Returns a BLMarkup object with a valid toString function and the following properties:
 * el: the original Cheerio element
 * links: links to files with the extensions pdf, doc, docx, txt, epub, or mobi
 * hasText: boolean value for whether BLMarkdown believes it has extracted legitimate content
 * fromFormat: the format of the document from which content was extracted; usually html if extracted from the page
 * @param {CheerioElement} el
 * @param {Function} getMarkdown
 */
class BLMarkdown extends DocConverter {
  constructor(el, getMarkdown) {
    super()

    // Include the element used in creation
    this.el = el

    // Set up default properties
    this.fromFormat = 'html'
    this.docFormat = ''
    this.text = ''
    this.needsConvert = false

    // Set up properties for links, types, etc.
    this.links = []

    // Get actual linked files
    this.links = el.find('div.readbelow a[href$=".pdf"], div.readbelow a[href$=".PDF"], div.readbelow a[href$=".doc"], div.readbelow a[href$=".docx"], div.readbelow a[href$=".txt"], div.readbelow a[href$=".epub"], div.readbelow a[href$=".mobi"]').get()
      .map(e => (e.attribs.href.replace(/^\//, 'https://bahai-library.com/')))

    // Get the document format
    for (let link of this.links) {
      let format = link.match(/\.([^\.]+)$/)[1]
      if (docTypes[format] > docTypes[this.docFormat]) {
        this.docFormat = format;
      }
    }

    // If there are no links, just return whatever we can
    if (!this.links.length) {
      this.text = getMarkdown(el)
    }
    else {

      if (el.find('h1,h2,h3').get().filter(function(e){
        return cheerio.load(e).text().match(/(?:formatted|proofread)/i)
      }).length > 0) {
        // Document probably has proofread / formatted text on page
        let textEl = el
        .clone()
        .find('div.readbelow,h3:contains(pdf),h3:contains(PDF),h3:contains(formatted),h3:contains(audio),h3:contains(Audio)')
        .remove()
        .end()

        // If there is sufficient text, use it
        if (textEl.text().trim().length > 99) {
          this.text = getMarkdown(el)
        }
        else {
          this.needsConvert = true
        }
      }
      else {
        this.needsConvert = true
      }
    }
    if (this.needsConvert) {
      this.convert
    }
  }
}

module.exports = BLMarkdown
