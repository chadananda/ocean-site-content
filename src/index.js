// spider various sites into markdown files for use in Ocean supplimental
const c = require('./common')
const args = require('minimist')(process.argv.slice(2))
const sh = require('shelljs')

const scrapers = {}
scrapers["centenary"] = {
  url: "https://centenary.bahai.us/news",
  handler: require('./spider/centenary-news')
}
scrapers["biographies"] = {
  url: "https://bahai-library.com/Biographies",
  handler: require('./spider/bahai-library-biographies')
}
scrapers["encyclopedia-articles"] = {
  url: "https://bahai-library.com/Encyclopedia",
  handler: require('./spider/bahai-library-encyclopedia-articles')
}
scrapers["letters"] = {
  url: "https://bahai-library.com/Letters",
  handler: require('./spider/bahai-library-letters')
}
scrapers["news-articles"] = {
  url: "https://bahai-library.com/Newspapers",
  handler: require('./spider/bahai-library-news-articles')
}
scrapers["pilgrim-notes"] = {
  url: "https://bahai-library.com/Pilgrims",
  handler: require('./spider/bahai-library-pilgrim-notes')
}
scrapers["published-articles"] = {
  url: "https://bahai-library.com/Articles",
  handler: require('./spider/bahai-library-published-articles')
}
scrapers["shoghi-effendi"] = {
  url: "https://bahai-library.com/Guardian",
  handler: require('./spider/bahai-library-shoghi-effendi')
}
scrapers["talks"] = {
  url: "https://bahai-library.com/Talks",
  handler: require('./spider/bahai-library-talks')
}
scrapers["theses"] = {
  url: "https://bahai-library.com/Theses",
  handler: require('./spider/bahai-library-theses')
}
scrapers["uhj-letters"] = {
  url: "https://bahai-library.com/UHJ-letters",
  handler: require('./spider/bahai-library-uhj-letters')
}
scrapers["uhj-documents"] = {
  url: "https://bahai-library.com/UHJ-documents",
  handler: require('./spider/bahai-library-uhj-documents')
}
scrapers["unauthorized-translations"] = {
  url: "https://bahai-library.com/Translations",
  handler: require('./spider/bahai-library-unauthorized-translations')
}
scrapers["unpublished-articles"] = {
  url: "https://bahai-library.com/Articles-unpublished",
  handler: require('./spider/bahai-library-unpublished-articles')
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
