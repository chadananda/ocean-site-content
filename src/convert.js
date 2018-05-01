const { execSync } = require('child_process')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

// Set up required docker containers
try {
  execSync('docker pull kalledk/pdftotext')
}
catch(e) {
  console.error(e)
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
        let moreText = ''
        switch (ext) {
          case 'pdf':
          case 'PDF':
            // TODO: use request and request-cache instead of curl
            let pdf = await exec('docker run --rm -i kalledk/pdftotext < <(curl -s "' + url.replace('"', '\\"') + '")', {
              shell: '/bin/bash',
            })
            if (pdf.stderr) throw new Error(pdf.stderr)
            moreText = pdf.stdout
            // TODO: clean up converted text from pdf format
            // TODO: break apart paragraphs by detecting indents
            // TODO: convert paragraphs with spaces in front to blockquotes
            // TODO: remove lines with only numbers
            // TODO: remove header and footer lines
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
      }
      catch(err) {
        console.error(err.message)
        this.conversionError = true
        convertedText += '\n\[Error converting from ' + url + ' on ' + new Date().toISOString().split('T')[0] + '\]\n\n\n'
      }
    }
  }
  this.text += convertedText
  return true
}

module.exports = DocConverter
