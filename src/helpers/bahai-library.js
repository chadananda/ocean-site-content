// Helper module for bahai-library.com
const pageCache = require('../page_cache');
const c = require('../common')
const $ = require('cheerio')
const TurndownService = require('turndown')

function repeat(char, x) {
  return Array(x + 1).join(char)
}

module.exports = {

  getDocMeta(doc) {
    // Returns the standard document metadata block for bahai-library.com documents
    return doc.$('td.content>div').first()
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

  getMarkdown(el) {
    let val = this.turndown.turndown($(el).html())
      .replace(/([^`\\])`(?!`)/g, "$1'")    // Replace ` with ' when not \ escaped
      .replace(/^`(?!`)/g, "'")             // Replace ` with ' at beginning of line
      .replace(/---|--/g, '—')              // Replace --- and -- with em dash —
    return val
  },

  getMainContentMarkdown(el) {
    // Use on the document content block.
    // Returns elements for the actual document content.

    // Check if the document has a linked pdf
    let pdf = el.find('div.readbelow a[href$=".pdf"]')
    if (pdf.length) {
      let headers = el.find('h1,h2,h3').filter(function(){
        return $(this).text().match(/(?:formatted|proofread)/i)
      })
      if (headers.length) {
        // Document probably has proofread / formatted text on page
        let textEl = el
        .clone()
        .find('div.readbelow,h3:contains(pdf),h3:contains(PDF),h3:contains(formatted),h3:contains(audio),h3:contains(Audio)')
        .remove()
        .end()

        if (textEl.text().trim().length > 100) {
          return this.getMarkdown(el)
        }
        else {
          // TODO: extract text from pdf documents
          return this.getMarkdown(el.find('div.readbelow'))
        }
      }
    }
    return this.getMarkdown(el)
  },

  turndown: new TurndownService({headingStyle: 'atx'})
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
        var href = node.getAttribute('href').replace(/^\//, 'https://bahai-library.com/')
        var title = node.title ? ' "' + node.title + '"' : ''
        return '[' + content + '](' + href.replace(' ','%20') + title + ')'
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
}