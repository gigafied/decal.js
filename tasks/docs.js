const cp = require('child_process')
const packageJSON = require('../package.json')

console.log('')

let yui = cp.fork('./node_modules/yuidocjs/lib/cli.js', [
  '-c',
  './tasks/yuidoc.json',
  '--project-version',
  packageJSON.version
])

yui.on('exit', function (code, signal) {
  if (!code) console.log('')
})
