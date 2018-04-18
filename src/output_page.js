const fs = require('fs')
const mkdirp = require('mkdirp')


module.exports = function(outputFolder, outputFile, meta, markdown) {
  var header = [].concat(['---'], Object.keys(meta).map((key) => {
    if (typeof(meta[key]) === 'array' || typeof(meta[key]) === 'object') {
      return (meta[key].length > 1 ? [key + ':', ...meta[key].toArray()].join('\n  - ') : `${key}: ${meta[key][0]}`)
    }
    else {
      return `${key}: ${meta[key]}`
    }
  }), ['---']).join('\n')
  // output with forced directory
  mkdirp(outputFolder, function (err) {
    if (err) console.error(err)
    else {
      fs.writeFileSync(outputFile, header+'\n\n\n'+markdown, 'UTF-8')
      console.log('Saved file:  ' + outputFolder + outputFile)
    }
  })
}
