/**
@class decal

Replaces all whitespace at the beginning and end of a `String`.

@method trim
@param {String} str The `String` to trim.
@return {String} The trimmed string.
*/

'use strict'

module.exports = function (s) {
  return typeof s === 'string' ? s.replace(/^\s+|\s+$/gm, '') : s
}
