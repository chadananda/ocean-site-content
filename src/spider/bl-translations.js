// spider unauthorized-translations from bahai-library.com
let c = require('../common')
const BLCollection = require('../helpers/bahai-library')

module.exports = new BLCollection ({
  name: "bl-translations",
  title: "Unpublished Translations (bahai-library.com)",
  blSection: "Translations",
})
