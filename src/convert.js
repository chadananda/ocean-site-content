const { execSync } = require('child_process')

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
    this.convertSuccessful = false
  }
}

DocConverter.prototype.length = function length() {
  return this.text.length
}

DocConverter.prototype.toString = function blMarkdownToString() {
  return this.text
}

DocConverter.prototype.convert = function(ext) {
  let convertedText = ''
  for (let url of this.links) {
    if (url.match(new RegExp('\.' + ext + '$'))) {
      try {
        let moreText = ''
        switch (ext) {
          case 'pdf':
          case 'PDF':
            moreText = execSync('docker run --rm -i kalledk/pdftotext < <(curl -s "' + url + '")', {
              shell: '/bin/bash',
            }).toString()
            break;
          case 'txt':
          case 'TXT':
            moreText = execSync('curl -s "' + url + '")').toString()
            break;
          case 'doc':
          case 'DOC':
          case 'docx':
          case 'DOCX':
          case 'epub':
          case 'EPUB':
          case 'mobi':
          case 'MOBI':
          default:
            throw new Error('No conversion yet for .' + ext + ' files.')
        }
        if (moreText.length) {
          this.convertSuccessful = true
          convertedText += moreText + '\n\[converted from ' + url + ' on ' + new Date().toISOString().split('T')[0] + '\]\n\n\n'
        }
      }
      catch(err) {
        console.error(err.message)
        convertedText += '\n\[Error converting from ' + url + ' on ' + new Date().toISOString().split('T')[0] + '\]\n\n\n'
      }
    }
  }
  this.text += convertedText
  // TODO: extract text from other documents, e.g. .txt(13), .doc(9), .docx(7), .mobi(3), etc.
}

module.exports = DocConverter
