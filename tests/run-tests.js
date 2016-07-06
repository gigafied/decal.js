'use strict'

const fs = require('fs')
const path = require('path')
const chai = require('chai')
const Mocha = require('mocha')

let timeout = null

global.decal = require('../src/index.js')

let mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec'
})

mocha.checkLeaks()
global.expect = chai.expect

function done (failures) {
  process.exit(failures)
}

function addTests (folder, p) {
  fs.readdirSync(folder).filter(function (file) {
    p = path.join(folder, file)

    if (fs.statSync(p).isDirectory()) {
      addTests(p)
      return
    }

    if (file === 'index.js') {
      mocha.addFile(p)
    }
  })
}

module.exports = function (cb) {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  mocha.run(cb)
}

addTests(path.join(__dirname, 'decal'))

timeout = setTimeout(function () {
  mocha.run(done)
}, 0)
