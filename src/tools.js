const sh = require('shelljs')
const fs = require('fs')
const jsdiff = require('diff')
const args = require('minimist')(process.argv.slice(2))

const tools = {

  fileCount: function() {
    let text = "| Folder                         | Scraped | Indexed |      Diff |\n"
       text += "| ------------------------------ | ------- | ------- | --------- |\n"
    for (let f of this._getCollectionFolders()) {
      folder = `./output/${f}/`
      let s = sh.ls(folder).length.toString()
      let i = (sh.test('-e', `${folder}.index.txt`) ? (sh.cat(`${folder}/.index.txt`).split('\n').length - 1).toString() : ' ')
      let d = ''
      let differences = this._diffCollection(f)
      if (differences.length) {
        let a = 0, r = 0
        for (let diff of differences) {
          if (diff.added) a += diff.count
          if (diff.removed) r += diff.count
        }
        d = `-${r}/+${a}`
      }
      text += `| ${f.padEnd(30)} | ${s.padStart(7)} | ${i.padStart(7)} | ${d.padStart(9)} |\n`
    }
    text += `\n${sh.exec('date')}`
    fs.writeFileSync('./filecount.md', text)
  },

  diffCollection: function(folderName = '') {
    if (folderName) {
      let differences = this._diffCollection(folderName)
      this._logDiffCollection(differences)
    }
    else {
      for (let folderName of this._getCollectionFolders()) {
        console.log(`### ${folderName}:`)
        let differences = this._diffCollection(folderName)
        this._logDiffCollection(differences)
      }
    }
  },

  _getCollectionFolders: function() {
    return sh.ls('output').filter(f => {return sh.test('-d', `output/${f}`)})
  },

  _diffCollection: function(folderName) {
    try {
      if (sh.test('-f', './output/' + folderName + '/.index.txt')) {
        let folder = './output/' + folderName.replace('output', '').trim('/') + '/'
        let ls = sh.ls(folder).join('\n') + '\n'
        let idx = sh.cat(folder + '.index.txt')
        return jsdiff.diffTrimmedLines(ls, idx)
      }
      else {
        return []
      }
    }
    catch(e) {
      console.error(e)
    }
  },

  _logDiffCollection: function(differences) {
    if (differences.length) {
      for (let d of differences) {
        if (d.added) console.log(`+ ${d.value.replace(/\n/g,'\n+ ')}`)
        if (d.removed) console.log(`- ${d.value.replace(/\n/g,'\n- ',)}`)
      }
    } 
  },

}

if (args._.length > 0 && !args._[0].match(/^_/) && tools.hasOwnProperty(args._[0])) {
  tools[args._[0]](...args._.splice(1))
}

module.exports = tools