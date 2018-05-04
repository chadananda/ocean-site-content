const extractor = require('pdftotext-stdin')
const request = require('request')
const cachedRequest = require('cached-request')(request)
cachedRequest.setCacheDirectory('page_cache/documents')

function escRegex(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

class DocConverter {
  constructor(links) {
    this.links = (links ? Array(links) : [])
    this.text = ''
    this.conversionError = false
    this.conversionSuccess = false
  }
}

DocConverter.prototype.length = function length() {
  return this.text.length
}

DocConverter.prototype.toString = function blMarkdownToString() {
  return this.text
}

DocConverter.prototype.convert = async function(ext) {
  let convertedText = ''
  for (let url of this.links) {
    if (url.match(new RegExp('\.' + ext + '$'))) {
      try {
        switch (ext) {
          case 'pdf':
          case 'PDF':

            // Get the pdf, from cache if possible
            let pdfToConvert = await cachedRequest({url: url, ttl: (60*60*24*30)})
            let pdfText = await extractor.extractTextFromPdfStream(pdfToConvert)

            // Process the pdf text
            moreText = this._convertPdf(pdfText)
            
            break
          case 'txt':
          case 'TXT':
            let txt = await exec('curl -s "' + url + '")')
            if (txt.stderr) throw new Error(txt.stderr)
            moreText = txt.stdout
            break
          case 'doc':
          case 'DOC':
          case 'docx':
          case 'DOCX':
          case 'epub':
          case 'EPUB':
          case 'mobi':
          case 'MOBI':
          default:
            // TODO: extract text from other documents, e.g. .txt(13), .doc(9), .docx(7), .mobi(3), etc.
            throw new Error('No conversion yet for .' + ext + ' files.')
        }
        if (moreText.length) {
          this.conversionSuccess = true
          convertedText += moreText + '\n\[converted from ' + url + ' on ' + new Date().toISOString().split('T')[0] + '\]\n\n\n'
        }
        else {
          convertedText += '\n\[text could not be retrieved\]\n\n'
        }
      }
      catch(err) {
        console.error(err)
        this.conversionError = true
        convertedText += '\n\[Error converting from ' + url + ' on ' + new Date().toISOString().split('T')[0] + '\]\n\n\n'
      }
    }
  }
  this.text += convertedText
  return true
}

DocConverter.prototype._convertPdf = function(fullText) {
  let fnFlag = false
  let textArray = []
  let dupLinesCheck = {}
  let prevLine = ''
  let indPrev = null
  fullText = fullText.replace(/\r\n/gm, '\n')
  fullText = fullText.replace(/\r/gm, '\n')
  let pdfPages = fullText.match(/\f/gm).length
  let pdfPars = fullText.match(/\n\n/gm).length
  if (pdfPars / pdfPages > 10) {
    fullText = fullText.replace(/\n\n/gm, '\n')
  }
  fullText = fullText.replace('\t', '    ')
  .split('\n')
  .reduce((text,line,i,arr) => {

    // Initialize dupLinesCheck on first pass
    if (i === 1) {
      if (
        // don't start with a blank line
        !text.length ||
        // don't start with a line that only has numbers
        text.match(/^[\d\s]+$/)
      ) {
        text = ''
      }
      else {
        text = text + '\n'
        Object.assign(dupLinesCheck, {[text.replace(/[\d\s]/g, '')]: text})
      }
    }

    // Check for last pass
    let isLastLine = (i === arr.length-1)

    // Find previous, current, and next indent
    let indPrev = arr[i-1].match(/^(\s*)/)[1].length
    let indCurr = line.match(/^(\s*)/)[1].length
    let indNext = (isLastLine ? 1000 : arr[i+1].match(/^(\s*)/)[1].length)

    // For blank lines, just return a blank line.
    if (line === '') {
      return text + '\n'
    }
    // else if (line.match('bewildered.')) {
    //   debugger
    // }


    // Put footnote numbers on the same line as the footnote
    if (line.match(/^\[?\d{1,3}[\]\.]*\s*$/)) {
      indPrev = indNext
      fnFlag = true
      prevLine = '\\[' + line.match(/^\[?(\d+)[\]\.]*\s*$/)[1] + '\\] '
      return text + '\n' + prevLine
    }
    else if (fnFlag) {
      fnFlag = false
      prevLine += line.trim()
      return text + line.trim() + '\n'
    }

    // Check duplicate lines
    let lineTextOnly = line.replace(/[\d\s]/g, '')
    if (lineTextOnly === '') {
    }
    else if (lineTextOnly === 'p' || lineTextOnly === 'page') {
      return text
    }
    else {
      if (dupLinesCheck.hasOwnProperty(lineTextOnly)) {
        if (dupLinesCheck[lineTextOnly].count < 4) {
          dupLinesCheck[lineTextOnly].count += 1
          dupLinesCheck[lineTextOnly].text.push(line)
          // For the first three times, process the text as usual
        }
        else if (
          line.match(/\$*\d[\s\S]*?[\%\$\.][\s\S]*?\d/) ||
          line.match(/[Ii]bid\.?/)
        ) {
          // Just log these lines
          dupLinesCheck[lineTextOnly].count += 1
        }
        else if (dupLinesCheck[lineTextOnly].count === 4) {
          dupLinesCheck[lineTextOnly].count += 1
          return text
            .replace(new RegExp('\\n+' + escRegex(dupLinesCheck[lineTextOnly].text[0]) + '\\n+'), '\n')
            .replace(new RegExp('\\n+' + escRegex(dupLinesCheck[lineTextOnly].text[1]) + '\\n+'), '\n')
            .replace(new RegExp('\\n+' + escRegex(dupLinesCheck[lineTextOnly].text[2]) + '\\n+'), '\n')
            .replace(new RegExp('\\n+' + escRegex(dupLinesCheck[lineTextOnly].text[3]) + '\\n+'), '\n')
        }
        else {
          dupLinesCheck[lineTextOnly].count += 1
          return text
        }
      }
      else {
        Object.assign(dupLinesCheck, {[lineTextOnly]: {count: 1, text: [line]}})
      }
    }

    // Remove lines that are exclusively numeric
    if (line.match(/^[\d\s]+$/)) {
      return text + '\n'
    }

    // Find lines that are indented and should start a new paragraph
    if (!isLastLine && (
      // line is indented more than the last, and more than or equal to the next line
      ((indCurr > indPrev) && (indCurr >= indNext)) ||
      // or...
      ((
        // line is indented more than the next and equal to the previous line...
        (indCurr > indNext) && (indCurr === indPrev) || 
        // or less than the previous and equal to the next line...
        (indCurr < indPrev) && (indCurr === indNext)
        // ...and the previous line looks like the end of a quote
      ) && prevLine.match(/["'!\d\.\?]\s*$/))
    )) {
      text += '\n'
    }

    // Find lines that are blockquotes, and add a > character for markdown
    if (indCurr && (
      // line is indented the same as the next line
      (indCurr === indNext) ||
      // line is indented more than the next line and the same as the previous line, which does not end in a quote end
      ((indCurr === indPrev) && (indCurr > indNext) && !prevLine.match(/['"\d\.\?!]\s*$/))
    )) {
      text += '> '
    }

    // Numbers at the beginning of lines can become li items
    line = line.replace(/^(\d+)\./, '$1\\.').trim()

    prevLine = line
    return text + line + '\n'

  }).replace(/\n\n+/gm, '\n\n').replace(/\f/gm, '')

  return fullText
}

module.exports = DocConverter
