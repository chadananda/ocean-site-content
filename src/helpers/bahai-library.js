// Helper module for bahai-library.com
const pageCache = require('../page_cache');
const c = require('../common')
const $ = require('cheerio')

module.exports = {
  getDocMeta(doc) {
    // Returns the standard document metadata block for bahai-library.com documents
    return doc.$('td.content>div').first()
    // TODO: replace relative links with absolute
  },
  getDocContent(doc) {
    // Returns the standard content block for bahai-library.com documents
    return doc.$('td.content')
      .clone()
      .children('table')
      .remove()
      .end()
      .find('object')
      .remove()
      .end()
      .children('br:first-child')
      .remove()
      .end()
      .children('div:first-child')
      .remove()
      .end()
      // TODO: replace relative links with absolute
  },
  getTitle(el) {
    // Use on the document metadata block.
    // Returns the title as found in the element, which may have more information than $('title').
    return el
      .find('h1,h2,h3')
      .first()
      .text()
      .replace(/\n/g, ' ') || ''
  },
  getAuthor(el) {
    // Use on the document metadata block.
    // Returns a list of authors as found in the element, separated by commas.
    // The list may include editors, translators, and compilers.
    return el
      .find('a[href^="/author/"]')
      .map(function(){return $(this).text().trim()})
      .get()
      .join(', ')
      || ''
  },
  getSource(el) {
    // Use on the document metadata block.
    // Returns the source in which the document was originally published, based on text in the element.
    if (el.text().match(/published in/i)) {
      let source = el
        .html()
        .replace(/[\s\S]*published in *(.+?)(?:\n|<br\/*>)[\s\S]*/, "$1")
      return $.load(source).text().replace(/\s+/g, ' ')
    }
    return ''
  },
  getYear(el) {
    // Use on the document metadata block.
    // Dumbly returns the last string of exactly four digits in the element.
    let dates = el
      .clone()
      .children()
      .remove()
      .end()
      .contents()
      .map(function(){
        return this.data.match(/\b\d{4}\b/g)
      })
      || ['']
    return dates.toArray().pop()
  },
  getImage(el) {
    // Use on the document content block.
    // Returns the src attribute, as a url, of the first image in the content.
    let src = el.find('img')
      .first()
      .attr('src')
    if (typeof(src) === "string" && src[0] === '/') src = 'https://bahai-library.com' + src
    return src || ''
  },
  getAudio(el) {
    // Use on the document content block.
    // Tries a bunch of stuff to get the url(s) of one or more audio files for the document.
    // if (el.find('a[href="/wttp/programs.html"]').length) {
    //   // TODO: get audio file links

    // }
  },
  getHtmlContent(el) {
    // Use on the document content block.
    // Returns elements for the actual document content.
    
    let textEl = el
      .clone()
      .find('div.readbelow,h3:contains(pdf),h3:contains(PDF),h3:contains(formatted),h3:contains(audio),h3:contains(Audio)')
      .remove()
      .end()
 
    if (textEl.text().trim().length > 100) return textEl.map(function() {
      return $(this).html()
    }).toArray().join("\n")

    // For documents with embedded pdf and no text
    let pdf = el.find('div.readbelow a[href$=".pdf"]')
    if (pdf.length) {
      // TODO: extract text from pdf documents
      return $(pdf).html()
    }
  },
}