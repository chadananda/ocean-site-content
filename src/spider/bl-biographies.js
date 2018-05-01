// spider biographies from bahai-library.com
let c = require('../common')
let BLCollection = require('../helpers/bahai-library')

module.exports = new BLCollection({
  name: "bl-biographies",
  title: "Biographies (bahai-library.com)",
  blSection: "Biographies",
})

