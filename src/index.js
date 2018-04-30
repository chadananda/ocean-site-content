// spider various sites into markdown files for use in Ocean supplimental
const c = require('./common')
const args = require('minimist')(process.argv.slice(2))
const sh = require('shelljs')

const normalizedPath = require("path").join(__dirname, "spider");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  let m = require("./spider/" + file)
  if (m.name !== 'example') c.collections[m.name] = m
})

// Process handlers
if (args._.length > 0) {
  let baseFolder = __dirname.replace(/src$/,'')
  for (let arg of args._) {
    regex = new RegExp('^' + baseFolder + 'output\/');
    if (c.collections.hasOwnProperty(arg)) {
      console.log('Processing collection: "' + arg + '"')
      c.processUrl(c.collections[arg].url, c.collections[arg].handler)
    }
    else if (arg.match(regex) && !arg.match(/\.\./) && sh.test('-f', arg)) {
      // find the right collection
      try {
        if (collection = Object.keys(c.collections).filter(k => (c.collections[k].hasOwnProperty('folder') ? arg.match(c.collections[k].folder) : arg.match('output/' + k + '/')) )[0]) {
          console.log('Scraping ' + arg.replace(baseFolder, ''))
          let header = sh.head({'-n': 20}, arg)
        if (url = header.match(/^url:\s*(.+)$/im)[1]) {
            c.processUrl(url, c.collections[collection].handler, true)
        } else console.error('Could not get url info from file header: \n' + header)
      }
        else {
          throw new Error('No collection found for ' + arg)
        }
      }
      catch(err) {
        console.error(err)
      }
    }
    else {
      console.error('Could not process "' + arg + '": invalid argument')
    }
  }
}
else {
  Object.keys(c.collections).forEach(function(k){
    var collection = c.collections[k]
    if (!collection.archive) {
      c.processUrl(collection.url, collection.handler)
    }
  })
  // TODO: update filecount
}
