/**
@class decal

Used by `decal.Object.prototype.prop()` for property descriptors.

@method defineProperty
@private
*/

'use strict'

const isFunction = require('./isFunction')

function defineGetter (obj, p, fn) {
  if (isFunction(fn)) obj.__meta.getters[p] = fn

  return function () { return this.get(p) }
}

function defineSetter (obj, p, fn) {
  if (isFunction(fn)) obj.__meta.setters[p] = fn

  return function (val) { return this.set(p, val) }
}

module.exports = function (obj, prop, descriptor) {
  let d = descriptor

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
    typeof descriptor.defaultValue !== 'undefined'
    ? descriptor.defaultValue : descriptor.value
  )

  delete d.value
  delete d.writable

  return d
}
