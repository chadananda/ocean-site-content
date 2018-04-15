// spider various sites into markdown files for use in Ocean supplimental
// 
const c = require('./common')
const scrapers = [
  {
    url: "https://centenary.bahai.us/news/persian-peace-apostle-predicts-war-europe",
    handler: require('./spider/centenary-news')
  },
]

// Process our handlers 
for (var s of scrapers) {
    c.processUrl(s.url, s.handler)
}
