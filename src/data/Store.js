/**

The store is a glorified cache, with convenience methods to work with your
Adapters to update or query your persistence layer as needed.

By having a Store, you will need to access your persistence layer
much less frequently and you will be able to return records from the
store instantly.

@module decal
@submodule data

@class decal.Store
@constructor
*/

'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const Class = require('../core/Class')
const Collection = require('./Collection')

module.exports = Class.extend({

  init () {
    this.__adapters = {}
    this.__registry = {}
    this.__store = {}
  },

  getAdapterFor (model) {
    model = this.modelFor(model)
    let adapter = this.__adapters[model.collectionKey] || this.defaultAdapter
    if (!adapter) throw new Error('No adapter found for ' + model.collectionKey)
    return adapter
  },

  addModel (model, adapter) {
    let mKey = model.modelKey
    let cKey = model.collectionKey

    if (this.__registry[mKey]) {
      throw new Error('`modelKey` already registered : "' + mKey + '".')
    } else if (this.__registry[cKey]) {
      throw new Error('`collectionKey` already registered : "' + cKey + '".')
    }

    if (model.prototype.store) {
      throw new Error(mKey + ' model is already assigned to another store')
    }

    model.prototype.store = this

    this.__registry[mKey] = model
    this.__registry[cKey] = model

    adapter = adapter || this.defaultAdapter

    if (adapter) {
      adapter.registerModel(model)
      this.__adapters[model.collectionKey] = adapter
    }
  },

  addModels () {
    for (let i = 0; i < arguments.length; i++) {
      this.addModel(arguments[i])
    }
  },

  setAdapter (models, adapter) {
    for (let i = 0; i < models.length; i++) {
      let model = this.modelFor(models[i])
      adapter.registerModel(model)
      this.__adapters[model.collectionKey] = adapter
    }
  },

  /**
  Clear the store. Removes all record instances in the store.
  This does not in any way affect the persistence layer or call any methods
  on the models' adapters.

  @method clear
  @param  {decal.Model} Model
  */

  clear () {
    this.__store = {}
  },

  /**
  Adds new record(s) to the store.
  This does not in any way affect the persistence layer or call any methods
  on the models' adapters.

  @method add
  @param  {String|Model} model The modelKey or Model class to add records for.
  @param  {Model|Array} records The record or records you want to add to the store.
  @return {decal.Collection}
  */

  add (mKey, records) {
    if (arguments.length === 1) {
      records = mKey
      records = Array.isArray(records) ? records : [records]
      mKey = records[0].modelKey
    } else records = Array.isArray(records) ? records : [records]

    let isInRegistry = !!this.modelFor(mKey)
    let collection = null

    for (let i = 0, l = records.length; i < l; i++) {
      let record = records[i]
      if (!collection) {
        if (!isInRegistry) this.addModel(record.constructor)
        collection = this.getCollection(mKey)
      }

      if (!~collection.indexOf(record)) {
        set(record, 'store', this)
        collection.push(record)
      }
    }

    return collection
  },

  /**
  Removes record(s) from the store.
  This does not in any way affect the persistence layer or call any methods
  on the models' adapters.

  @method remove
  @param  {String|Model} model The modelKey or Model class to remove records for.
  @param  {Model|Array} The record or records you want to remove from the store.
  @return {decal.Collection}
  */

  remove (mKey, records) {
    if (arguments.length === 1) {
      records = mKey
      records = Array.isArray(records) ? records : [records]
      mKey = records[0].modelKey
    } else records = Array.isArray(records) ? records : [records]

    let collection = this.getCollection(mKey)

    for (let i = 0, l = records.length; i < l; i++) {
      collection.remove(records[i])
    }

    return collection
  },

  /**
  Returns all the records of a specific type in the store.

  @method all
  @param  {String|Model} model The modelKey or Model class of the records you want to get.
  @return {decal.Collection}
  */

  all (mKey) {
    return this.getCollection(mKey)
  },

  /**
  Returns all the records of a specific type from the persistence layer
  and adds them to the store.

  @method fetchAll
  @param  {String|Model} model The modelKey or Model class of the records you want to get.
  @return {decal.Collection}
  */

  fetchAll (mKey) {
    let model = this.modelFor(mKey)
    let adapter = this.getAdapterFor(model)

    return adapter.fetchAll(model).then(function (json) {
      json = Array.isArray(json) ? json : [json]
      for (let i = 0; i < json.length; i++) {
        let item = json[i]
        let record = this.findOrCreate(model, item[model.primaryKey])
        record.deserialize(item)
      }
      return this.all(model)
    }.bind(this))
  },

  /**
  Find a record in the store.

  @method find
  @param  {String|Model} model The modelKey or Model class of the record you want to find.
  @param  {String|Number|Object} q The primary key or an object of parameters you want to match.
  @return {decal.Model}
  */

  find (mKey, q) {
    let collection = this.getCollection(mKey)

    if (typeof q === 'number' || typeof q === 'string') return collection.findBy('pk', q)

    if (typeof q === 'function') return collection.find(q)

    return collection.find(item => {
      for (let p in q) {
        if (get(item, p) !== q[p]) return false
      }
      return true
    })
  },

  /**
  Find a record in the store by primary key or create one.

  @method findOrCreate
  @param  {String|Model} model The modelKey or Model class of the record you want to find.
  @param  {String|Number} pk The primary key of the record.
  @return {decal.Model}
  */

  findOrCreate (mKey, pk) {
    let record = pk ? this.find(mKey, pk) : null
    if (!record) {
      record = this.modelFor(mKey).create()
      set(record, 'pk', pk)
      this.add(mKey, record)
    }
    return record
  },

  /**
  Creates a new record and adds it to the store.

  @method createRecord
  @param  {String|Model} model The modelKey or Model class of the record you want to find.
  @param  {Object} data The data you want to populate the record with.
  @return {decal.Model}
  */

  createRecord (mKey, data, addToStore = true) {
    let record = this.modelFor(mKey).create(data)
    if (addToStore) this.add(mKey, record)
    return record
  },

  /**
  Filters through all records in the store of a specific type and returns matches.

  @method filter
  @param  {String|Model} model The modelKey or Model class of the record you want to find.
  @param  {Function|Object} q An object of parameters you want to match or a filter function.
  @return {decal.Array}
  */

  filter (mKey, q) {
    let collection = this.getCollection(mKey)

    if (typeof q === 'function') {
      return collection.filter(q)
    }

    return collection.filter(item => {
      let doesMatch = true
      for (let p in q) {
        if (get(item, p) !== q[p]) doesMatch = false
      }
      return doesMatch
    })
  },

  getCollection (mKey) {
    let Class = this.modelFor(mKey)
    if (!Class) throw new Error('No model was found with a modelKey of "' + mKey + '"')

    let collection = this.__store[Class.collectionKey]
    if (!collection) collection = this.__store[Class.collectionKey] = this.createCollection(Class)
    return collection
  },

  createCollection (mKey) {
    let Class = this.modelFor(mKey)
    if (!Class) throw new Error('No model was found with a modelKey of "' + mKey + '"')

    let collection = Collection.create()
    set(collection, 'modelClass', Class)
    return collection
  },

  /**
  Given a modelKey or collectionKey returns the corresponding Model Class.

  @method modelFor
  @param  {String} model The modelKey or collectionKey to get the Class for.
  @return {decal.Model}
  */

  modelFor (mKey) {
    return typeof mKey !== 'string' ? mKey : this.__registry[mKey]
  },

  destroy (destroyRecords) {
    if (destroyRecords) {
      for (let p in this.__store) this.__store[p].destroy(true)
    }

    for (let p in this.__registry) this.__registry[p].prototype.store = null

    this.__registry = null
    this.__store = {}
    this._super.apply(this, arguments)
  }
})
