// Helper module for bahai-library.com
const pageCache = require('../page_cache')
const c = require('../common')
const $ = require('cheerio')
const Collection = require('../collection')
const BLMarkdown = require('./bl_markdown')
const TurndownService = require('turndown')

function repeat(char, x) {
  return Array(x + 1).join(char)
}

class BLCollection extends Collection {
  constructor(conf) {
    if (!conf.url && !conf.blSection) {
      throw new Error("BLCollection conf must have either a url or a blSection")
    }
    conf.url = conf.url || `https://bahai-library.com/${conf.blSection}`
    conf.mask = conf.mask || "https://bahai-library.com/"
    super(conf)
  }
}

BLCollection.prototype.handler = function(doc) {
  if (!this.blSection) throw new Error("Default BLCollection handler requires blSection in conf")
  if (doc.url.match(new RegExp('https://bahai-library.com/' + this.blSection + '.*'))) {
    // For index pages
    c.processLinks(doc, doc.$('td.content ol li>a:first-child'), this.name)
    c.processLinks(doc, doc.$('a[href^="/' + this.blSection + '/"]'), this.name)
    this.deIndexUrl(doc.url)
  }
  else if (doc.$('td.content table.chapterhead a[href$="&chapter=all"]').length) {
    c.processLinks(doc, doc.$('td.content table.chapterhead a[href$="&chapter=all"]'), this.name)
    this.deIndexUrl(doc.url)
  }
  else {
    let blDoc = this.parseDocument(doc)
    blDoc.meta.collection = this.title
    // blDoc.meta.collectionImage: '', // an image representative of the collection
    // blDoc.meta.copyright: '', // the copyright information from the spidered site

    this.outputPage(blDoc)
  }
}

BLCollection.prototype.parseDocument = function(doc) {
  let docMeta = this.getDocMeta(doc)
  let docContent = this.getDocContent(doc)
  let blMarkdown = new BLMarkdown(docContent, this.getMarkdown.bind(this))
  if (blMarkdown.needsConvert) {
    blMarkdown.convert(blMarkdown.docFormat)
  }
  let blDoc = {
    docMeta: docMeta,
    docMetaMarkdown: this.getMarkdown(docMeta),
    docContent: docContent,
    docContentMarkdown: blMarkdown,
    meta: {
      url: doc.url, // the url of the document
      title: this.getTitle(docMeta) || doc.$('title').text(), // the title of the document, e.g. doc.$('title')
      audio: this.getAudio(docContent), // url to the audio file, e.g. doc.$('audio').attr('src')
      author: this.getAuthor(docMeta), // name of the author,
      image: this.getImage(docContent), // url to a representative image, if available
      source: this.getSource(docMeta), // the original publication
      date: this.getYear(docMeta), // date when the content was originally created
      doctype: 'website', // should always be 'website'
      status: 'search-only', // should always be 'search-only'
      encumbered: false, // whether app user is prevented from scrolling (should always be false for website doctype)
    }
  }
  if (blMarkdown.needsConvert) {
    blDoc.meta.converted_from = blMarkdown.links
  }
  return blDoc
}

BLCollection.prototype.outputPage = function(blDoc) {
  let outputFile = blDoc.meta.url.replace((this.mask || 'https://bahai-library.com/'), '') + '.md'
  let markdown = blDoc.docMetaMarkdown + "\n\n\n" + blDoc.docContentMarkdown
  c.outputPage(this.name, markdown, blDoc.meta)
  if ((blDoc.docContentMarkdown.needsConvert && !blDoc.docContentMarkdown.convertSuccessful) || blDoc.docContentMarkdown.length < 250) {
    c.outputPage(this.name, markdown, meta, '.' + outputFile)
  }
}

BLCollection.prototype.getDocMeta = function(doc) {
  // Returns the standard document metadata block for bahai-library.com documents
  return doc.$('td.content>div').first()
}

BLCollection.prototype.getDocContent = function(doc) {
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
}

BLCollection.prototype.getTitle = function(el) {
  // Use on the document metadata block.
  // Returns the title as found in the element, which may have more information than $('title').
  return el
    .find('h1,h2,h3')
    .first()
    .text()
    .replace(/\n/g, ' ') || ''
}

BLCollection.prototype.getAuthor = function(el) {
  // Use on the document metadata block.
  // Returns a list of authors as found in the element, separated by commas.
  // The list may include editors, translators, and compilers.
  return el
    .find('a[href^="/author/"]')
    .map(function(){return $(this).text().trim()})
    .get()
    .join(', ')
    || ''
}

BLCollection.prototype.getSource = function(el) {
  // Use on the document metadata block.
  // Returns the source in which the document was originally published, based on text in the element.
  if (el.text().match(/published in/i)) {
    let source = el
      .html()
      .replace(/[\s\S]*published in *(.+?)(?:\n|<br\/*>)[\s\S]*/, "$1")
    return $.load(source).text().replace(/\s+/g, ' ')
  }
  return ''
}

BLCollection.prototype.getYear = function(el) {
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
}

BLCollection.prototype.getImage = function(el) {
  // Use on the document content block.
  // Returns the src attribute, as a url, of the first image in the content.
  let src = el.find('img')
    .first()
    .attr('src')
  if (typeof(src) === "string" && src[0] === '/') src = 'https://bahai-library.com' + src
  return src || ''
}

BLCollection.prototype.getAudio = function(el) {
  // Use on the document content block.
  // Tries a bunch of stuff to get the url(s) of one or more audio files for the document.
  if ((links = el.find('a[href$="mp3"]')) && links.length) {
    return this._absoluteLinks(links)
  }
  else if ((links = el.find('a[href$="mp4"]')) && links.length) {
    return this._absoluteLinks(links)
  }
  else if ((links = el.find('a[href="/wttp/programs.html"]')) && links.length) {
    // TODO: get audio file links
  }
  return ''
}

BLCollection.prototype._absoluteLinks = function(links) {
  return links.map((i,e) =>
    $(e).attr('href').replace(/^\//, 'https://bahai-library.com/')
  )
}

BLCollection.prototype.getTextLength = function(el) {
  // Use on the document content block
  // Tries to determine if there is a linked document (pdf, epub, etc.) that needs to be converted
  let text = $(el).clone().find('blockquote').remove().end().find('div,p,span,font').find('*').remove().end().text().replace(/[\n\t]/g,'')
  return text.length
}

BLCollection.prototype.getMarkdown = function(el) {
  let val = this.turndown.turndown($(el).html())
    .replace(/([^`\\])`(?!`)/g, "$1'")    // Replace ` with ' when not \ escaped
    .replace(/^`(?!`)/g, "'")             // Replace ` with ' at beginning of line
    .replace(/---|--/g, '—')              // Replace --- and -- with em dash —
  return val
}

BLCollection.prototype.getMainContentMarkdown = function(el) {
  // Use on the document content block.
  // Returns elements for the actual document content.
  let blMarkdown = new BLMarkdown(el, this.getMarkdown.bind(this))
  if (blMarkdown.needsConvert) {
    blMarkdown.convert(blMarkdown.docFormat)
  }
  return blMarkdown
}

BLCollection.prototype.turndown = new TurndownService({headingStyle: 'atx'})
  .addRule('absoluteLinks', {
    filter: function (node, options) {
      return (
        node.nodeName === 'A' &&
        node.getAttribute('href')
      )
    },
    replacement: function(content, node, options) {
      if (node.getAttribute('href').match(/^#/)) {
        return content
      }
      var href = node.getAttribute('href').replace(/^\//, 'https://bahai-library.com/').replace(/ /g,'%20')
      var title = node.title ? ' "' + node.title + '"' : ''
      return '[' + content + '](' + href + title + ')'
    }
  })
  .addRule('absoluteImages', {
    filter: 'img',
    replacement: function (content, node) {
      var alt = node.alt || ''
      var src = node.getAttribute('src').replace(/^\//, 'https://bahai-library.com/') || ''
      var title = node.title || ''
      var titlePart = title ? ' "' + title + '"' : ''
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
    }
  })
  .addRule('multiLineStrong', {
    filter: ['strong', 'b'],
    replacement: function(content, node, options) {
      if (!content.trim()) return ''
      return content
        .split("\n")
        .map(i => (i.trim() ? "**" + i.trim() + "**" : i))
        .join("\n")
    }
  })
  .addRule('iAsBlock', {
    filter: ['em', 'i'],
    replacement: function(content, node, options) {
      return content
        .split('\n')
        .map(t => {
          if (!t.trim() || t.trim().match(/^_/) || t.trim().match(/_$/)) return t
          return t.replace(/^(\s*)(.+?)(\s*)$/, "$1_$2_$3")
        })
        .join('\n')
    }
  })
  .addRule('ulForBlockquote', {
    filter: 'ul',
    replacement: function (content, node) {
      var parent = node.parentNode
      if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
        return '\n' + content
      } else {
        splitContent = content.split('\n').map(c => (c.trim().match(/^(\* |\+ |- |[0-9]+\. )/) ? c : '> ' + c))
        return '\n\n' + splitContent.join('\n') + '\n\n';
      }
    }
  })
  .addRule('olForParagraphNumbers', {
    filter: 'ol',
    replacement: function (content, node, options) {
      var parent = node.parentNode
      if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
        return '\n' + content
      } else {
        let liContent = content.match(/^\s*\d+\.  /g)
        if (!liContent || (liContent.length !== content.split('\n'.length + 1))) {
          // Content in a list that is not supposed to be there: this is probably used for numbered paragraphs or chapters
          return '\n\n'
            + content
              .replace(/^\s(\d+\.)  /g, "_$1_  ")
              .replace(/^\s+/g, '')
            + '\n\n'
        }
        return '\n\n' + content + '\n\n'
      }
    }
  })
  .addRule('liForNumberedParagraphs', {
    filter: 'li',
    replacement: function (content, node, options) {
      content = content
        .replace(/^\n+/, '') // remove leading newlines
        .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
        .replace(/\n/gm, '\n    ') // indent
      var prefix = options.bulletListMarker + '   '
      var parent = node.parentNode
      if (parent.nodeName === 'OL') {
        var start = parent.getAttribute('start')
        var children = Array.from(parent.children).filter(e => e.tagName === 'LI')
        var index = Array.prototype.indexOf.call(children, node)
        prefix = (start ? Number(start) + index : index + 1) + '.  '
      }
      return (
        prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
      )
    }
  })
  .addRule('headersWithMultipleLines', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (content, node, options) {
      var hLevel = Number(node.nodeName.charAt(1))
      // concatenate all lines within a single header
      content = content.replace(/\s*\n\s*/gm, ' ')
      if (options.headingStyle === 'setext' && hLevel < 3) {
        var underline = repeat((hLevel === 1 ? '=' : '-'), content.length)
        return (
          '\n\n' + content + '\n' + underline + '\n\n'
        )
      } else {
        return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n'
      }
    }
  })
  .addRule('preformattedText', {
    filter: ['pre'],
    replacement: function(content) {
      return content.split('\n').map(i => i.replace(/^\s*/, '')).join('  \n')
    }
  })

module.exports = BLCollection