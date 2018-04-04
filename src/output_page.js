const fs = require('fs') 
const mkdirp = require('mkdirp')


module.exports = function(outputFolder, outputFile, meta, markdown) { 
  var header = [].concat(['---'], Object.keys(meta).map((key) =>`${key}: ${meta[key]}`), ['---']).join('\n')
  console.log(`Outputing file: ${outputFile}`) 
  
  // output with forced directory
  mkdirp(outputFolder, function (err) {
    if (err) console.error(err)
    else fs.writeFileSync(outputFile, header+'\n\n\n'+markdown, 'UTF-8') 
  })
}
  
  
  