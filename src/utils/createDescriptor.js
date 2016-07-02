/***********************************************************************
@class decal
************************************************************************/

'use strict'

const assert = require('./assert');
const isFunction = require('./isFunction')

function defineGetter (obj, p, fn) {
  if (isFunction(fn)) obj.meta().getters[p] = fn

  return function () {
    return obj.get(p);
  }
}

function defineSetter (obj, p, fn) {
  if (isFunction(fn)) obj.meta().setters[p] = fn

  return function (val) {
    return obj.set(p, val);
  }
}
/***********************************************************************
Used by `decal.Object.prototype.prop()` for property descriptors.

@method defineProperty
@private
************************************************************************/

module.exports = function (obj, prop, descriptor) {
  var d

  d = descriptor

  if (d.__meta && (d.__meta.isAttribute || d.__meta.isRelationship)) {
    d = d.clone()
  }

  d.configurable = true
  d.enumerable = typeof descriptor.enumerable !== 'undefined' ? descriptor.enumerable : true

  if (prop.indexOf('__') === 0) {
    d.configurable = false
    d.enumerable = false
  }

  d.get = defineGetter(obj, prop, descriptor.get)
  d.set = defineSetter(obj, prop, descriptor.set)

  d.defaultValue = (
    typeof descriptor.defaultValue !== 'undefined' ?
      descriptor.defaultValue : descriptor.value
  )

  delete d.value
  delete d.writable

  return d
}
