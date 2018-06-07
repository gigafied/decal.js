/**
Define a hasMany relationship (one to many).

@method hasMany
@param  {String} modelKey The modelKey of the relationship.
@param  {Object} opts Options for the relationship.
@return {ComputedProperty}
*/

'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const assert = require('../utils/assert')
const computed = require('../utils/computed')
const Collection = require('./Collection')

module.exports = function make (mKey, opts) {
  opts = opts || {}

  if (opts.map) opts.embedded = true

  let hasMany = computed({

    get (key) {
      this.__meta.data[key] = this.__meta.data[key] || Collection.create()
      return this.__meta.data[key]
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

      if (val) assert('Must be a Collection.', val instanceof Collection)
      if (data[key] instanceof Collection && val !== data[key]) data[key].destroy(opts.embedded)

      data[key] = val
    }
  })

  hasMany.meta({
    type: 'hasMany',
    isRelationship: true,
    opts: opts,
    relationshipKey: mKey,

    serialize (filter, dirty) {
      let meta = hasMany.meta()
      let key = meta.key
      let map = opts.map || {}

      let val = get(this, key)

      if (val) val = val.serialize(opts.embedded, filter, dirty)

      if (val && opts.map) {
        let val2 = {}

        for (let i = 0; i < val.length; i++) {
          if (map.value) val2[val[i][map.key]] = val[i][map.value]
          else {
            val2[val[i][map.key]] = val[i]
            delete val[i][map.key]
          }
        }

        val = val2
      }

      if (!filter || filter(meta, key, val)) return val
    },

    serializeDirty (filter) {
      return hasMany.meta().serialize.call(this, filter, true)
    },

    deserialize (val, override, filter, resetDirty = true) {
      let meta = hasMany.meta()
      let key = meta.key
      let map = opts.map || {}
      let store = this.store

      val = val || []

      if (opts.map) {
        let val2 = []

        for (let i in val) {
          let obj, obj2

          if (val[i] && !Array.isArray(val[i]) && typeof val[i] === 'object') obj = val[i]
          else obj = {value: val[i]}

          obj.key = i
          obj2 = {}

          for (let j in obj) obj2[map[j] || j] = obj[j]

          val2.push(obj2)
        }

        val = val2
      }

      let records = []
      let collection = get(this, key) || Collection.create()

      for (let i = 0; i < val.length; i++) {
        if (val && val[i]) {
          let record
          if (opts.embedded && typeof val[i] === 'object') {
            record = store.modelFor(mKey).create()
            record.deserialize(val[i], override, filter, resetDirty)
          } else record = store.findOrCreate(mKey, val[i])
          records.push(record)
        }
      }

      if (collection.length) collection.empty()
      collection.push(...records)
      set(this, key, collection)
      return collection
    },

    revert (revertRelationships) {
      let meta = hasMany.meta()
      let key = meta.key
      let pristine = this.__meta.pristineData

      if (opts.embedded) {
        let val = get(this, key)
        if (val) {
          pristine[key] = undefined
          val.revertAll(revertRelationships)
        }
      } else if (pristine[key]) set(this, key, pristine[key])
    }
  })

  hasMany.clone = function () {
    return make(mKey, opts)
  }

  return hasMany
}
