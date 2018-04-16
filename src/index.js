// spider various sites into markdown files for use in Ocean supplimental
const c = require('./common')
const args = require('minimist')(process.argv.slice(2))

const scrapers = {}
scrapers["centenary"] = {
  url: "https://centenary.bahai.us/news/persian-peace-apostle-predicts-war-europe",
  handler: require('./spider/centenary-news')
};
scrapers["biographies"] = {
  url: "https://bahai-library.com/Biographies",
  handler: require('./spider/bahai-library-biographies')
};
scrapers["uhj-letters"] = {
  url: "https://bahai-library.com/UHJ-letters",
  handler: require('./spider/bahai-library-uhj-letters')
};

// Process handlers
if (args._.length > 0) {
  for (var k of args._) {
    if (scrapers.hasOwnProperty(k)) {
      console.log('Processing collection: "' + k + '"')
      c.processUrl(scrapers[k].url, scrapers[k].handler)
    }
    else {
      console.log('Could not process "' + k + '": invalid collection')
    }
  }
}
else {
  Object.keys(scrapers).forEach(function(k){
    var s = scrapers[k]
    c.processUrl(s.url, s.handler)
  })
}
