'use strict'

const error = require('./error')

module.exports = function (msg, test) {
  if (!test) {
    error(msg)
  }
}
