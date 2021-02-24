/**
@class decal

Merge one `Array` or `Object` into another `Array` or `Object`.
Modifies the first `Object` or `Array` passed in as an argument.

@method merge
@param {Object|Array} obj1 The `Object` or `Array` to merge into.
@param {Object|Array} obj2 The `Object` or `Array` containing values to merge.
@param {Boolean} [deep=false] Whether or not to deep copy objects when merging
(`true`) or shallow copy (`false`)
@return {Object|Array} The merged `Object` or `Array`.
*/

'use strict'

const isObject = require('./isObject')

module.exports = function merge (a, b, deep) {
  function arrayOrObject (o) {
    return Array.isArray(o) ? [] : isObject(o) ? {} : false
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    a = a || []
    b = b || []

    for (let i = 0; i < b.length; i++) {
      let o = b[i]
      if (!~a.indexOf(o)) {
        let d = deep ? arrayOrObject(o) : null
        a.push(d ? merge(d, o, true) : o)
      }
    }
    return a
  } else if (isObject(a) || isObject(b)) {
    a = a || {}
    b = b || {}

    for (let p in b) {
      if (!b.hasOwnProperty(p)) continue
      // Prototype Pollution https://snyk.io/vuln/SNYK-JS-DECAL-1051028
      if (p === '__proto__' || p === 'constructor') {
        continue
      }
      let o = b[p]
      let d = deep ? arrayOrObject(o) : null
      a[p] = d ? merge(d, o, true) : o
    }

    return a
  }

  return null
}
