// spider published-articles from bahai-library.com
let c = require('../common')
const BLCollection = require('../helpers/bahai-library')

module.exports = new BLCollection ({
  name: "bl-articles-published",
  title: "Published Articles (bahai-library.com)",
  blSection: "Articles",
})
