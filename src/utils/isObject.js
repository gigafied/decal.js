/**
@class decal

Test whether or not a value is an `Object`.

@method isObject
@param {Any} obj The value to check.
@return {Boolean} Whether or not the value is an `Object`.
*/

'use strict'

let objectTypes = {
  'function': true,
  'object': true,
  'unknown': true
}

module.exports = function (obj) {
  return obj ? !!objectTypes[typeof obj] : false
}
