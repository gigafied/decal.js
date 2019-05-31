/**
Define a hasOne relationship.

@method hasOne
@param  {String} modelKey The modelKey of the relationship.
@param  {Object} opts Options for the relationship.
@return {ComputedProperty}
*/

'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const computed = require('../utils/computed')

module.exports = function make (mKey, opts) {
  opts = opts || {}

  let hasOne = computed({

    get (key) {
      let store = this.store
      let meta = this.__meta
      let val = null

      if (typeof this.__meta.data[key] === 'undefined') {
        if (typeof opts.defaultValue !== 'undefined') val = opts.defaultValue
        else if (opts.embedded) val = store.__registry[mKey].create()
        if (typeof val !== 'undefined') meta.data[key] = val
      }

      return meta.data[key]
    },

    set (val, key) {
      let meta = this.__meta
      let store = this.store
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

      if (val) {
        if (store && !(val instanceof store.__registry[mKey])) {
          if (typeof val !== 'string' && typeof val !== 'number') val = String(val)
          val = opts.embedded ? store.findOrCreate(mKey, val) : store.find(mKey, val)
        }
      } else val = null
      data[key] = val
    }
  })

  hasOne.meta({

    type: 'hasOne',
    isRelationship: true,
    opts: opts,
    relationshipKey: mKey,

    serialize (filter, dirty) {
      let key,
        val,
        meta,
        store,
        undef

      meta = hasOne.meta()
      key = meta.key
      store = this.store

      val = get(this, key)

      if (val && val instanceof store.__registry[mKey]) {
        if (opts.embedded) {
          val = dirty ? val.serializeDirty(filter) : val.serialize(filter)
          if (dirty && Object.keys(val).length === 0) { val = undef }
        } else val = get(val, 'pk')
      }

      if (!filter || filter(meta, key, val)) return val
    },

    serializeDirty (filter) {
      return hasOne.meta().serialize.call(this, filter, true)
    },

    deserialize (val, override, filter, resetDirty = true) {
      let meta = hasOne.meta()
      let key = meta.key
      let store = this.store

      if (opts.embedded) {
        let record = get(this, key) || store.__registry[mKey].create()
        if (val && typeof val === 'object') val = record.deserialize(val, override, filter, resetDirty)
      }

      set(this, key, val)
      return val
    },

    revert (revertRelationships) {
      let val = get(this, hasOne.meta().key)
      if (val) val.revert(revertRelationships)
    }
  })

  hasOne.clone = function () {
    return make(mKey, opts)
  }

  if (opts.validation) hasOne.validation = opts.validation

  return hasOne
}
