/**
@class decal

Creates a copy of a plain Object or Array. (Do not use on decal.Object/Array instances).

@method clone
@param {Object|Array} obj The object or array to clone.
@param {Boolean} [deep=false] Whether or not to deep copy (`true`) or shallow copy (`false`)
*/

'use strict'

const merge = require('./merge')
const isObject = require('./isObject')

module.exports = function (o, deep, a) {
  function arrayOrObject (o) {
    return Array.isArray(o) ? [] : isObject(o) ? {} : null
  }

  a = arrayOrObject(o)

  return a ? merge(a, o, deep) : null
}
