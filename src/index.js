// spider various sites into markdown files for use in Ocean supplimental
const c = require('./common')
const args = require('minimist')(process.argv.slice(2))
const sh = require('shelljs')

const scrapers = {}
scrapers["centenary"] = {
  url: "https://centenary.bahai.us/news/persian-peace-apostle-predicts-war-europe",
  handler: require('./spider/centenary-news')
}
scrapers["biographies"] = {
  url: "https://bahai-library.com/Biographies",
  handler: require('./spider/bahai-library-biographies')
}
scrapers["uhj-letters"] = {
  url: "https://bahai-library.com/UHJ-letters",
  handler: require('./spider/bahai-library-uhj-letters')
}
scrapers["uhj-documents"] = {
  url: "https://bahai-library.com/UHJ-documents",
  handler: require('./spider/bahai-library-uhj-documents')
}

// Process handlers
if (args._.length > 0) {
  let baseFolder = __dirname.replace(/src$/,'')
  for (var k of args._) {
    regex = new RegExp('^' + baseFolder + 'output\/');
    if (scrapers.hasOwnProperty(k)) {
      console.log('Processing collection: "' + k + '"')
      c.processUrl(scrapers[k].url, scrapers[k].handler)
    }
    else if (k.match(regex) && !k.match(/\.\./) && sh.test('-f', k)) {
      let collection = k.match(/output\/([^\/]+)/)[1]
      if (scrapers.hasOwnProperty(collection)) {
        console.log('Scraping ' + k.replace(baseFolder, ''))
        let header = sh.head({'-n': 20}, k)
        if (url = header.match(/^url:\s*(.+)$/im)[1]) {
          c.processUrl(url, scrapers[collection].handler, true)
        } else console.log('Could not get url info from file header: \n' + header)
      }
      else console.log('Folder ' + collection + ' is not a collection name.')
    }
    else {
      console.log('Could not process "' + k + '": invalid argument')
    }
  }
}
else {
  Object.keys(scrapers).forEach(function(k){
    var s = scrapers[k]
    c.processUrl(s.url, s.handler)
  })
}
