// spider various sites into markdown files for use in Ocean supplimental
// 
const Spider = require('node-spider')
const centenary_news_handler = require('./spider/centenary-news.js')



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


// Process our handlers 
spider.queue(
  'https://centenary.bahai.us/news/persian-peace-apostle-predicts-war-europe', 
  centenary_news_handler
)

 