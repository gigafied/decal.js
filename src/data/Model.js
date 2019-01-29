/**

decal's Model, Store and Adapter Classes offers you flexible and easy way to work with your data layer.

Using decal.attr(), decal.belongsTo() and decal.hasMany() you can define simple or complex model
structures.

```javascript

let MyStore = decal.Store.create()

let Person = decal.Model.extend({

  primaryKey: 'id',
  modelKey: 'person',

  adapter: decal.RESTAdapter.create(),
  store: MyStore,

  schema: decal.Schema.create({
    firstName: decal.attr(String),
    lastName: decal.attr(String),

    children: decal.hasMany('person'),
    spouse: decal.belongsTo('person')
  })
})

let dad = Person.create({
  firstName: 'John',
  lastName: 'Doe'
})

let mom = Person.create({
  firstName: 'Jane',
  lastName: 'Doe'
})

let child1 = Person.create({
  firstName: 'Mary',
  lastName: 'Doe'
})

let child2 = Person.create({
  firstName: 'Bob',
  lastName: 'Doe'
})

dad.spouse = mom
dad.children.push(child1, child2)

decal.Q.all([
  mom.save(),
  child1.save(),
  child2.save()
]).then(function () {
  dad.save()
})

```

Looking at the example above, it might be a bit confusing why we are saving `mom` and `children`
before we save the `dad` record.

The reason for this is that the mom and children do not yet exist, thus if we tried to `serialize()` the `dad`
record they would come back with null primary key values.

@module decal
@submodule data

*/

const get = require('../utils/get')
const set = require('../utils/set')
const assert = require('../utils/assert')
const computed = require('../utils/computed')
const Class = require('../core/Class')
const PromiseQueue = require('../utils/PromiseQueue')

let Model = Class.extend({

  /**

  The Model Class is what all records are created from. Models provide
  a uniform way to work with your records no matter what your backend
  or persistence layer is, even if you mix and match across a project.

  @module decal
  @submodule data

  @class decal.Model
  @constructor
  */

  /**
  The Store instance this model uses. This will only be defined if you
  have called addModel on a Store.

  @property store
  @type decal.Store
  @default null
  */

  /**
  The Adapter assigned to this model.

  @property adapter
  @type decal.Adapter
  @default null
  */
  adapter: computed(function () {
    return this.store.getAdapterFor(this.constructor)
  }, 'store'),

  /**
  The modelKey you want to use for the model. This will likely influence your adapter.
  i.e. for a RESTAdapter your modelKey would be used in the url for all requests
  made for instances of this model. For a MongooseAdapter,
  this would likely dictate the name of your tables.

  @property modelKey
  @type String
  @default null
  */

  modelKey: null,

  /**
  The collectionKey you want to use for the model. Much like modelKey this is the
  pluralized form of modelKey. This will be auto-defined as your modelKey + 's' unless
  you explicity define it.

  @property collectionKey
  @type String
  @default null
  */

  /**
  The property name of the primaryKey you are using for this Model.

  @property primaryKey
  @type String
  @default 'id'
  */
  primaryKey: 'id',

  /**
  An Array of all the property names that have been changed since the last save() or fetch().

  @property dirtyAttributes
  @type Array
  @default null
  */
  dirtyAttributes: null,

  /**
  Whether or not the record is currently saving.

  @property isSaving
  @type Boolean
  @default false
  */

  isSaving: false,

  /**
  Whether or not the record is currently being fetched.

  @property isFetching
  @type Boolean
  @default false
  */

  isFetching: false,

  /**
  Whether or not the record has been fetched/loaded.

  @property isLoaded
  @type Boolean
  @default false
  */
  isLoaded: false,

  /**
  Whether or not the record is currently being deleted.

  @property isDeleting
  @type Boolean
  @default false
  */

  isDeleting: false,

  /**
  Whether or not the record has one or more changed properties since the
  last save() or fetch().

  @property isDirty
  @type Boolean
  @default false
  */

  isDirty: computed(function () {
    return !!get(this, 'dirtyAttributes.length')
  }, 'dirtyAttributes.length'),

  /**
  Opposite of isDirty.

  @property isClean
  @type Boolean
  @default true
  */

  isClean: computed(function () {
    return !get(this, 'isDirty')
  }, 'isDirty'),

  /**
  Is the record new? Determined by the existence of a primary key value.

  @property isNew
  @type Boolean
  @default false
  */

  isNew: computed(function () {
    return !get(this, 'pk')
  }, 'pk'),

  /**
  Get the primary key value of the record.

  @property pk
  @type String|Number
  */
  pk: computed({

    get () {
      return this.primaryKey ? get(this, this.primaryKey) : null
    },

    set (val) {
      return this.primaryKey ? set(this, this.primaryKey, val) : null
    }
  }),

  __init (props) {
    this.__skipInit = true
    this._super()
    delete this.___skipInit

    let meta = this.__meta
    meta.data = {}

    let cMeta = this.constructor.__meta = this.constructor.__meta || {}
    let dirty = []
    set(this, 'dirtyAttributes', dirty)

    meta.isInitialized = false

    if (cMeta.attributes) {
      meta.attributes = cMeta.attributes
      meta.relationships = cMeta.relationships
    } else {
      let attributes = []
      let relationships = []

      for (let p in meta.properties) {
        let desc = meta.properties[p]
        let pMeta = desc.meta && desc.meta()
        if (pMeta) {
          if (pMeta.isAttribute) attributes.push(p)
          else if (pMeta.isRelationship) relationships.push(p)
        }
      }
      meta.attributes = cMeta.attributes = attributes
      meta.relationships = cMeta.relationships = relationships
    }

    meta.pristineData = {}
    meta.saveQueue = new PromiseQueue()

    if (typeof props === 'object') this.deserialize(props)
    dirty.splice(0, dirty.length)
    meta.isInitialized = true

    if (this.init) this.init.apply(this, arguments)
    return this
  },

  /**
  Serialize a record.

  @method serialize
  @param {Function} filter A custom function to filter out attributes as you see fit.
  @return {Object}
  */

  serialize (filter) {
    let meta = this.__meta
    let attributes = meta.attributes
    let relationships = meta.relationships
    let props = attributes.concat(relationships)
    let json = {}

    for (let i = 0, l = props.length; i < l; i++) {
      let p = props[i]
      let desc = this.prop(p)
      let pMeta = desc.meta()
      let key = pMeta.opts.key || p
      let val = pMeta.serialize.call(this, filter)

      if (typeof val !== 'undefined') set(json, key, val)
    }

    if (this.primaryKey) {
      let pk = get(this, 'pk')
      if (typeof pk !== 'undefined') set(json, this.primaryKey, pk)
    }

    return json
  },

  /**
  Serialize the dirty attributes of a record.

  @method serializeDirty
  @param {Function} filter A custom function to filter out attributes as you see fit.
  @return {Object}
  */

  serializeDirty (filter, partialEmbedded = true) {
    if (this.isDestroyed) return {}
    let meta = this.__meta
    let attributes = meta.attributes
    let relationships = meta.relationships
    let props = attributes.concat(relationships)
    let dirty = (get(this, 'dirtyAttributes') || []).concat()
    let json = {}

    for (let i = 0, l = props.length; i < l; i++) {
      let p = props[i]
      let desc = this.prop(p)
      let pMeta = desc.meta()
      let type = pMeta.type
      let key = pMeta.opts.key || p

      if (pMeta.isRelationship && (pMeta.opts.embedded || type === 'hasMany')) {
        const rel = get(this, key)
        if ((rel && rel.isDirty) || ~dirty.indexOf(p) || (type === 'hasMany' && !pMeta.opts.embedded)) {
          // Because we don't dirty collections when items are added or removed, we have to always serialize non embedded hasManys
          set(json, key, pMeta.serialize.call(this, filter))
        } else if (partialEmbedded && (pMeta.opts.embedded || type !== 'hasMany')) {
          const val = pMeta.serializeDirty.call(this, filter)
          if (typeof val !== 'undefined') set(json, key, val)
        }
      } else if (~dirty.indexOf(p)) {
        const val = pMeta.isAttribute ? pMeta.serializeDirty.call(this, filter) : pMeta.serialize.call(this, filter)
        if (typeof val !== 'undefined') set(json, key, val)
      }
    }

    return json
  },

  /**
  De-serialize a record.

  @method deserialize
  @param  {Object} json The object containing the properties you want to deserialize.
  @param  {Boolean} override Whether or not you want to update properties that have already been dirtied.
  @param {Function} filter A custom function to filter out attributes as you see fit.
  @return {Model}
  */

  deserialize (json, override, filter, resetDirty = true) {
    if (this.isDestroyed) return this
    let meta = this.__meta
    if (!json) return this

    let dirty = (get(this, 'dirtyAttributes') || []).concat()

    let attributes = meta.attributes
    let relationships = meta.relationships
    let props = attributes.concat(relationships)
    let i = props.length

    while (i--) {
      let p = props[i]
      let desc = this.prop(p)
      let pMeta = desc.meta()
      let di = dirty.indexOf(p)

      if (~di) {
        if (!override) continue
        if (resetDirty) dirty.splice(i, 1)
      }

      let key = pMeta.opts.key || p
      let val = get(json, key)

      if (typeof val !== 'undefined' && (!filter || filter(pMeta, key, val))) {
        val = pMeta.deserialize.call(this, val, override, filter, resetDirty)
        meta.pristineData[p] = val
      }
    }

    if (this.primaryKey && json[this.primaryKey]) {
      set(this, 'pk', json[this.primaryKey])
    }

    if (resetDirty) set(this, 'dirtyAttributes', dirty)
    set(this, 'isLoaded', true)

    return this
  },

  /**
  Patches a record, recursively.

  @method patch
  @param  {Object} The data you want to update.
  @return {Model}
  */

  patch (obj) {
    function updateRecursively (obj2, context) {
      for (let p in obj2) {
        let val = obj2[p]
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          updateRecursively(val, context[p])
          continue
        }
        set(context, p, val)
      }
    }
    updateRecursively(obj, this)
    return this
  },

  /**
  Marks all properties as clean.

  @method undirty
  @param  {Boolean} recursive Whather you want to undirty all embedded relationships as well.
  @return {Model}
  */

  undirty (recursive) {
    if (this.isDestroyed) return
    let dirty = get(this, 'dirtyAttributes')
    if (dirty && dirty.length) {
      dirty.splice(0, dirty.length)
    } else if (!recursive) return

    let meta = this.__meta
    let relationships = meta.relationships
    let i = relationships.length

    while (i--) {
      let p = relationships[i]
      let desc = this.prop(p)
      let pMeta = desc.meta()
      if (pMeta.opts.embedded) {
        let val = get(this, p)
        if (val && typeof val.undirty === 'function') val.undirty(true)
      }
    }

    return this
  },

  /**
  Saves any changes to this record to the persistence layer (via the adapter).
  Also adds this record to the store.
``
  @method save
  @return {Promise}
  */

  save () {
    let saveQueue = this.__meta.saveQueue
    return saveQueue.add(() => {
      let isNew = get(this, 'isNew')
      set(this, 'isSaving', true)

      if (isNew) this.store.add(this)

      let promise = this.adapter.saveRecord(this)
      if (isNew) {
        this.emit('new')
        this.undirty(true)
      } else {
        const dirty = Object.freeze(this.serializeDirty(null, false))
        this.undirty(true)
        this.emit('save', dirty)
      }

      return promise.then(json => {
        if (this.isDestroyed || saveQueue.length > 1) return this
        set(this, 'isSaving', false)
        set(this, 'isLoaded', true)

        return this
      })
    })
  },

  /**
  Fetches and populates this record (via the adapter).

  @method fetch
  @return {Promise}
  */

  fetch (override) {
    let isNew = get(this, 'isNew')

    assert('Can\'t fetch records without a primary key.', !isNew)

    set(this, 'isFetching', true)

    return this.adapter.fetchRecord(this).then(json => {
      this.deserialize(json, !!override)
      this.emit('fetch')
      if (override) this.undirty(true)
      set(this, 'isFetching', false)
      set(this, 'isLoaded', true)
      return this
    })
  },

  /**
  Deletes this record (via the adapter). Also removes it from the store.

  @method delete
  @return {Promise}
  */

  delete () {
    set(this, 'isDeleting', true)

    return this.adapter.deleteRecord(this).then(() => {
      this.emit('delete')
      if (this.store) this.store.remove(this)
      this.destroy()
      return this
    })
  },

  /**
  Creates and returns a copy of this record, with a null primary key.

  @method clone
  @return {Model}
  */

  clone () {
    let json = this.serialize()
    if (typeof json[this.primaryKey] !== 'undefined') delete json[this.primaryKey]
    return this.constructor.create(json)
  },

  /**
  Reverts all changes made to this record since the last save() or fetch().

  @method revert
  @return {Model}
  */

  revert (revertRelationships) {
    let meta = this.__meta
    let attributes = meta.attributes
    let relationships = meta.relationships

    let props = attributes.concat(relationships)
    let i = props.length

    while (i--) {
      let p = props[i]
      let desc = this.prop(p)
      let pMeta = desc.meta()
      if (
        pMeta.isAttribute ||
        (pMeta.isRelationship &&
          (revertRelationships || pMeta.opts.embedded))
      ) {
        pMeta.revert.call(this, revertRelationships)
      }
    }

    this.emit('revert')
    return this
  },

  destroy () {
    if (this.isDestroyed) return

    let meta = this.__meta
    let relationships = meta.relationships
    let i = relationships.length

    while (i--) {
      let p = relationships[i]
      let desc = this.prop(p)
      let pMeta = desc.meta()

      let key = pMeta.opts.key || p

      if (pMeta.opts.embedded) {
        let val = get(this, key)
        if (val) { val.destroy() }
      }
    }
    set(this, 'dirtyAttributes', null)
    if (this.store) { this.store.remove(this) }

    return this._super.apply(this, arguments)
  }
})

Model.extend = function () {
  let SubClass = Class.extend.apply(this, arguments)
  let proto = SubClass.prototype

  if (proto.url) SubClass.url = proto.url
  if (proto.primaryKey) SubClass.primaryKey = proto.primaryKey

  if (proto.modelKey) {
    if (!proto.collectionKey) proto.collectionKey = proto.modelKey.concat('s')
    SubClass.modelKey = proto.modelKey
    SubClass.collectionKey = proto.collectionKey
  }

  return SubClass
}

module.exports = Model
