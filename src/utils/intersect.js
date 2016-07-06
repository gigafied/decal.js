/**
@class decal

Compare two arrays and return an `Array` with items that exist
in both arrays.

@method intersect
@param {Array} arr1 The first `Array` to compare.
@param {Array} arr2 The second `Array` to compare.
@return {Array} `Array` of items that exist in both arrays.
*/

'use strict'

module.exports = function (a, b) {
  let c = []
  let i = b.length

  if (!a.length || !i) return c

  while (i--) {
    let d = b[i]
    if (~a.indexOf(d)) c.push(d)
  }

  return c
}
