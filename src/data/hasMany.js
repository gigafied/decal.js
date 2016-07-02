'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const computed = require('../utils/computed')

/***********************************************************************
Define a hasMany relationship (one to many).

@method hasMany
@param  {String} modelKey The modelKey of the relationship.
@param  {Object} opts Options for the relationship.
@return {ComputedProperty}
************************************************************************/

module.exports = function make(type, opts) {

  opts = opts || {}

  if (opts.map) {
    opts.embedded = true
  }

  let hasMany = computed({

    get (key) {

      if (!this.__meta.data[key]) {
        this.__meta.data[key] = Collection.create()
      }

      return this.__meta.data[key]
    },

    set (val, key) {

      let meta,
        data,
        store,
        dirty,
        dirtyIdx,
        pristine

      meta = this.__meta
      store = this.store
      dirty = get(this, 'dirtyAttributes')
      data = meta.data
      pristine = meta.pristineData

      if (dirty) {

        if (typeof pristine[key] === 'undefined') {

          if (typeof data[key] === 'undefined') {
            pristine[key] = opts.defaultValue
          }

          else {
            pristine[key] = data[key]
          }

          dirty.push(key)
        }

        else {

          dirtyIdx = dirty.indexOf(key)

          if (pristine[key] === val && ~dirtyIdx) {
            dirty.remove(key)
          }

          else if (!~dirtyIdx) {
            dirty.push(key)
          }
        }
      }

      if (val) {
        $b.assert(
          'Must be a collection.',
          val instanceof Collection
        )
      }

      data[key] = val
    }
  })

  hasMany.meta({

    type: 'hasMany',
    isRelationship: true,
    opts: opts,
    relationshipKey: mKey,

    serialize (filter, dirty) {

      let i,
        val,
        map,
        key,
        val2,
        meta

      meta = hasMany.meta()
      key = meta.key
      map = opts.map || {}

      val = get(this, key)

      if (val) {
        val = val.serialize(opts.embedded, filter, dirty)
      }

      if (val && opts.map) {

        val2 = {}

        for (i = 0 i < val.length i++) {

          if (map.value) {
            val2[val[i][map.key]] = val[i][map.value]
          }

          else {
            val2[val[i][map.key]] = val[i]
            delete val[i][map.key]
          }
        }

        val = val2
      }

      if (!filter || filter(meta, key, val)) {
        return val
      }
    },

    serializeDirty (filter) {
      return hasMany.meta().serialize.call(this, filter, true)
    },

    deserialize (val, override, filter) {

      let i,
        j,
        obj,
        key,
        map,
        obj2,
        val2,
        meta,
        store,
        record,
        records,
        collection

      meta = hasMany.meta()
      key = meta.key
      map = opts.map || {}
      store = this.store

      val = val || []

      if (opts.map) {
        val2 = []

        for (i in val) {

          if (val[i] && !Array.isArray(val[i]) && typeof val[i] === 'object') {
            obj = val[i]
          }

          else {
            obj = { value: val[i] }
          }

          obj.key = i
          obj2 = {}

          for (j in obj) {
            obj2[map[j] || j] = obj[j]
          }

          val2.push(obj2)
        }

        val = val2
      }

      records = []
      collection = get(this, key) || Collection.create()

      for (i = 0 i < val.length i++) {

        if (val && val[i]) {

          if (opts.embedded && typeof val[i] === 'object') {
            record = store.modelFor(mKey).create()
            store.add(mKey, record)
            record.deserialize(val[i], override, filter)
          }

          else {
            record = store.findOrCreate(mKey, val[i])
          }

          records.push(record)
        }
      }

      collection.set('content', records)
      set(this, key, collection)

      return collection
    },

    revert (revertRelationships) {

      let key,
        val,
        meta,
        pristine

      meta = hasMany.meta()
      key = meta.key
      pristine = this.__meta.pristineData

      if (opts.embedded) {
        val = get(this, key)
        if (val) {
          pristine[key] = undefined
          val.revertAll(revertRelationships)
        }
      }

      else if (pristine[key]) {
        set(this, key, pristine[key])
      }
    }
  })

  hasMany.clone = function () {
    return make(mKey, opts)
  }

  return hasMany
}
