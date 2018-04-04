
var Spider = require('node-spider')
const fs = require('fs')
//const json = require('jsonfile')
// const hash = require('hash.js')
var TurndownService = require('turndown')
var turndownService = new TurndownService()


var spider = new Spider({
    // How many requests can be run in parallel 
    concurrent: 5,
    // How long to wait after each request 
    delay: 0,
    // A stream to where internal logs are sent, optional 
    logs: process.stderr,
    // Re-visit visited URLs, false by default 
    allowDuplicates: false,
    // If `true` all queued handlers will be try-catch'd, errors go to `error` callback 
    catchErrors: true,
    // If `true` the spider will set the Referer header automatically on subsequent requests 
    addReferrer: false,
    // If `true` adds the X-Requested-With:XMLHttpRequest header 
    xhr: false,
    // If `true` adds the Connection:keep-alive header and forever option on request module 
    keepAlive: false,
    // Called when there's an error, throw will be used if none is provided 
    error: function(err, url) {
    },
    // Called when there are no more requests 
    done: function() {
    },
 
    //- All options are passed to `request` module, for example: 
    headers: { 'user-agent': 'node-spider' },
    encoding: 'utf8'
});




var centenaryRequest = function(doc) {
  var outputfolder = 'output/centenary/'
  var host = 'https://centenary.bahai.us'
  var filename = doc.url.replace(/^https:\/\/centenary.bahai.us\/news\/(.*?)$/m, '$1')
  var outputFile = outputfolder + filename + '.md'
  var meta = {}
  meta.url = doc.url 
  meta.title = doc.$('h1.title').text()
  meta.audio = host + doc.$('.node.build-mode-full .field-field-audio audio').attr('src')
  meta.image = host + doc.$('.node.build-mode-full .field-field-clip-img img').attr('src')
    .replace('secondary-images', 'main-image')
  meta.source = doc.$('.node.build-mode-full .field-field-pubname').text().trim()
  meta.date = doc.$('.node.build-mode-full .field-field-historical-date').text().trim()
  meta.location = doc.$('.node.build-mode-full .location .adr').text().trim()
  
  var headerMD = '---\n'
  Object.keys(meta).forEach(key => headerMD += `${key}: ${meta[key]}\n` )
  headerMD += '---\n\n'

  
  var htmltext = doc.$('.node.build-mode-full .node-body').html()
  var bodyMD = '# ' + meta.title + '\n\n\n' + turndownService.turndown(htmltext)
  
  var finalMD = headerMD+bodyMD
  
  console.log(outputFile)
  fs.writeFileSync(outputFile, finalMD, 'UTF-8') 
  
  
  
   

    
    // uses cheerio, check its docs for more info 
    doc.$('a[href*="/news/"]').each(function(i, elem) {
        // do stuff with element 
        var href = doc.$(elem).attr('href').split('#')[0];
        var url = doc.resolve(href);
        // crawl more 
        //
        //
        //console.log(url)
        //spider.queue(url, handleRequest);
    });
};
 
// start crawling Centenary
// 
var startURL = 'https://centenary.bahai.us/news/persian-peace-apostle-predicts-war-europe'
spider.queue(startURL, centenaryRequest);

