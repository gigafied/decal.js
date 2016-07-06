/**
@class decal

Serializes an object into URL params (or request body)

@method params
@param {Object} obj The `Object` to serialize.
@return {String} The serialized Object.
*/

'use strict'

function bodyEncode (s) {
  return encodeURIComponent(s).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

module.exports = function (o, isBody) {
  let encode = isBody ? bodyEncode : encodeURIComponent

  let result = ''

  for (let p in o) {
    result += (result ? '&' : '') + encode(p) + '=' + encode(o[p])
  }

  return result
}
