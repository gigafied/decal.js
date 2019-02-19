/**
Define an attribute.

@method attr
@param  {Type} type The value type of the attribute.
@param  {Object} opts Options for the attribute
@return {ComputedProperty}
*/

'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const computed = require('../utils/computed')

module.exports = function make (type, opts) {
  if (typeof type === 'object') {
    opts = type
    type = String
  }

  type = type || String
  opts = opts || {}

  let attr = computed({

    get (key) {
      let meta = this.__meta
      let val = meta.data[key]
      return typeof val !== 'undefined' ? val : opts.defaultValue
    },

    set (val, key) {
      let meta = this.__meta
      let dirty = get(this, 'dirtyAttributes')
      let data = meta.data
      let pristine = meta.pristineData

      if (dirty) {
        if (typeof pristine[key] !== 'undefined') {
          let dirtyIdx = dirty.indexOf(key)
          if (pristine[key] === val && ~dirtyIdx) dirty.splice(dirtyIdx, 1)
          else if (!~dirtyIdx) dirty.push(key)
        } else {
          pristine[key] = typeof data[key] !== 'undefined' ? data[key] : opts.defaultValue
          dirty.push(key)
        }
      }

      data[key] = val
    }
  })

  attr.meta({
    type: type,
    isAttribute: true,
    opts: opts,

    serialize (filter) {
      let meta = attr.meta()
      let key = meta.key
      let val = get(this, key)
      if (!filter || filter(meta, key, val)) return val
    },

    serializeDirty (filter) {
      return attr.meta().serialize.call(this, filter, true)
    },

    deserialize (val) {
      set(this, attr.meta().key, val)
      return val
    },

    revert () {
      let meta = attr.meta()
      let pristine = this.__meta.pristineData
      if (pristine[meta.key]) set(this, meta.key, pristine[meta.key])
    }
  })

  attr.clone = function () {
    return make(type, opts)
  }

  return attr
}

