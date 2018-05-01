// spider news-articles from bahai-library.com
let c = require('../common')
const BLCollection = require('../helpers/bahai-library')

module.exports = new BLCollection ({
  name: "bl-news-articles",
  title: "News Articles (bahai-library.com)",
  blSection: "Newspapers",
})
