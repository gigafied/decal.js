/***********************************************************************
@class decal
************************************************************************/

'use strict'

/***********************************************************************
Test whether or not a value is a `Function`.

@method isFunction
@param {Any} fn The value to check.
@return {Boolean} Whether or not the value is a `Function`.
************************************************************************/

module.exports = function (obj) {
  return typeof obj === 'function'
}
