// Page Cacher

const SHA256 = require("crypto-js/sha256")
const fileExists = require('file-exists')
const jsonfile = require('jsonfile')
const mkdirp = require('mkdirp')
const cheerio = require('cheerio')
const url_tool = require('url')

const pageCacheFolder = 'page_cache/'
const MAX_AGE = 7 // days


function urltoPath(url) {
  if (!url) {
    console.error('Warning, call to urltoPath() with empty string')
    return ''
  }
  var newpath = pageCacheFolder + url.replace(/http[s]?:\/\//, '')
    .replace(/\//g, ',').replace(/[ ]+/g, '-') + '.json'
  return newpath
  //return pageCacheFolder + extractHostname(url) +'-' + SHA256(url)
}

function extractHostname(url) { 
  var hostname = '' 
  //find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("://") > -1) hostname = url.split('/')[2] 
    else hostname = url.split('/')[0] 
  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];
  return hostname;
}

function todayInt() {
  return Math.round((new Date()).getTime() / (1000 * 360 * 24))
}


module.exports = {
  
  put: function(doc) {  
    var cacheFilePath = urltoPath(doc.url)
    mkdirp(pageCacheFolder, function (err) {
      if (err) console.error(err)    
      else fileExists(cacheFilePath).then(exists => {
        if (!exists) {
          doc.pageCacheDate = todayInt()
          jsonfile.writeFile(cacheFilePath, doc, {spaces: 2, EOL: '\r\n'})
        }
      })
    })     
  },
  
  // returns a promise which resolves to 'doc' -- either FALSE or response object
  get: function(url) {
    return new Promise((resolve, reject) => { 
      // if file exists, load else false
      var cacheFilePath = urltoPath(url) 
      if (!cacheFilePath) reject('No legit path')
      fileExists(cacheFilePath).then(exists => {
        if (!exists) { resolve(false); return } 
        jsonfile.readFile(cacheFilePath, function(err, doc) {
          if (err) { reject('Bad JSON Cache file'); return } 
          if (todayInt()-doc.pageCacheDate<=MAX_AGE) { 
            doc.resolve = function(uri) { return url_tool.resolve(this.url, uri) }
            doc.$ = cheerio.load(doc.res.body)
            resolve(doc); return
          } else {
            fs.unlink(cacheFilePath)
            resolve(false); return
          }
        })  
      })
    })
  }
  
}





