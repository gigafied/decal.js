'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const computed = require('../utils/computed')

/***********************************************************************
Define a belongsTo relationship (many to one).

@method belongsTo
@param  {String} modelKey The modelKey of the relationship.
@param  {Object} opts Options for the relationship.
@return {ComputedProperty}
************************************************************************/

module.exports = function make(mKey, opts) {

  opts = opts || {}

  let belongsTo = computed({

    get (key) {

      let store = this.store
      let meta = this.meta()
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
          dirtyIdx = dirty.indexOf(key)
          if (pristine[key] === val && ~dirtyIdx) dirty.removeAt(dirtyIdx)
          else if (!~dirtyIdx) dirty.push(key)
        }
      } else {
          pristine[key] = typeof data[key] !== 'undefined' ? data[key] : opts.defaultValue
          dirty.push(key)
      }

      if (store && !val instanceof store.__registry[mKey]) {
        if (typeof val !== 'string' && typeof val !== 'number') val = String(val)
        val = store.findOrCreate(mKey, val)
      }

      data[key] = val
    }
  })

  belongsTo.meta({

    type: 'belongsTo',
    isRelationship: true,
    opts: opts,
    relationshipKey: mKey,

    serialize (filter, dirty) {

      let key,
        val,
        meta,
        store,
        undef

      meta = belongsTo.meta()
      key = meta.key
      store = this.store

      val = get(this, key)

      if (val && val instanceof store.__registry[mKey]) {

        if (opts.embedded) {
          val = dirty ? val.serializeDirty(filter) : val.serialize(filter)
          if (dirty && Object.keys(val).length === 0) { val = undef }
        }

        else {
          val = get(val, 'pk')
        }

      }

      if (!filter || filter(meta, key, val)) {
        return val
      }
    },

    serializeDirty (filter) {
      return belongsTo.meta().serialize.call(this, filter, true)
    },

    deserialize (val, override, filter) {

      let key,
        meta,
        store,
        record

      meta = belongsTo.meta()
      key = meta.key
      store = this.store

      if (opts.embedded) {

        record = get(this, key) || store.__registry[mKey].create()

        if (val && typeof val === 'object') {
          val = record.deserialize(val, override, filter)
        }
      }

      set(this, key, val)

      return val
    },

    revert (revertRelationships) {

      let key,
        val,
        meta

      meta = belongsTo.meta()
      key = meta.key

      val = get(this, key)

      if (val) {
        val.revert(revertRelationships)
      }
    }
  })

  belongsTo.clone = function () {
    return make(mKey, opts)
  }

  return belongsTo
}
