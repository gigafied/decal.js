'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const clone = require('../utils/clone')
const flatten = require('../utils/flatten')
const intersect = require('../utils/intersect')
const isFunction = require('../utils/isFunction')
const expandProps = require('../utils/expandProps')
const getObjKeyPair = require('../utils/getObjKeyPair')
const createDescriptor = require('../utils/createDescriptor')

const CoreObject = require('./CoreObject')

const IID = 0
const METAS = new Map()

function buildMeta (obj, meta) {

  if (!meta) meta = METAS.get(obj) || {}

  meta = clone(meta)
  METAS.set(obj, meta)

  meta.getters = clone(meta.getters || {})
  meta.setters = clone(meta.setters || {})

  meta.properties = clone(meta.properties || {})
  meta.methods = clone(meta.methods || [])

  meta.values = {}
  meta.computed = meta.computed || {}
  meta.watchers = new Map()
  meta.changedProps = []

  return meta
}

function parsePrototype (obj) {
  let meta = buildMeta(obj)
  appendToMeta(obj, meta)
  return meta
}

function appendToMeta (props, meta, obj) {
  let doSet = true
  if (!obj) {
    obj = props
    doSet = false
  }
  for (let p in props) {
    let v = props[p]
    if (isFunction(v)) {
      if (p !== 'constructor' && !~meta.methods.indexOf(p)) {
        meta.methods.push(p)
        if (doSet) obj[p] = props[p]
      }
    } else obj.prop(p, v)
  }
}

function defineProperty (obj, key, descriptor) {
  descriptor = clone(descriptor)
  Object.defineProperty(obj, key, descriptor)
  if (typeof descriptor.defaultValue !== 'undefined') {
    set(obj, key, descriptor.defaultValue, true, true)
  }
}

function watch (obj, props, fn) {
  let meta = METAS.get(obj)
  meta.watchers.set(fn, props)
  return fn
}

function unwatch (obj, ...fns) {
  let meta = METAS.get(obj)
  fns = flatten(fns)
  fns.forEach(fn => meta.watchers.delete(fn))
}

function unwatchAll (obj) {
  let meta = METAS.get(obj)
  meta.watchers.clear()
}

function notifyWatchers (obj, meta) {
  if (meta.watchersQueued) return
  meta.watchersQueued = true

  process.nextTick(() => {
    if (obj.isDestroyed) return
    let changed = meta.changedProps
    changed.forEach(p => changed.push(...(meta.computed[p] || [])))
    meta.watchers.forEach((props, fn) => {
      let intersected = intersect(props, changed)
      if (!intersected.length) return
      fn(obj, intersected)
    })
    meta.changedProps = []
    meta.watchersQueued = false
  })
}

let Obj = CoreObject.extend({

  /***********************************************************************

  `decal.Object` is the primary base Class. Most of your Objects will
  extend this Class, unless you need the added functionality of decal.Class.

  @class decal.Object
  @extends decal.CoreObject
  @constructor
  ************************************************************************/
  __init (props) {

    let meta = METAS.get(this)
    meta = meta ? buildMeta(this, meta) : parsePrototype(this)

    if (props && typeof props === 'object' && !Array.isArray(props)) {
      appendToMeta(clone(props), meta, this)
    }

    for (let p in meta.properties) defineProperty(this, p, meta.properties[p])

    if (this.init) this.init.apply(this, arguments)

    meta.isInitialized = true

    return this
  },

  init () {},

  meta () {
    return METAS.get(this)
  },

  /***********************************************************************
  Gets a subset of properties on this object.

  @method getProperties
  @param {Array} keys A listof keys you want to get
  @return {Object} Object of key : value pairs for properties in `keys`.
  ************************************************************************/
  getProperties (...args) {

    let o = {}

    if (args.length) {
      let props = flatten(args)
      for (let i = 0; i < props.length; i++) {
        o[props[i]] = this.get(props[i])
      }

      return o
    }

    let meta = METAS.get(this)

    for (p in meta.properties) {
      o[p] = this.get(p)
    }

    return o
  },

  /***********************************************************************
  Get or create a property descriptor.

  @method prop
  @param {String} key Poperty name.
  @param [val] Default value to use for the property.
  @return {PropertyDescriptor}
  ************************************************************************/
  prop (key, val) {

    let obj = getObjKeyPair(this, key)
    key = obj[1]
    obj = obj[0] || this

    let meta = METAS.get(obj)

    if (typeof val === 'undefined' && typeof meta.properties[key] !== 'undefined') {
      return meta.properties[key]
    }

    if (!val || !val.__isComputed) {
      val = {
        get: true,
        set: true,
        value: val,
        watch: null
      }
    }
    val = meta.properties[key] = createDescriptor(obj, key, val)

    if (val.__isComputed) {
      val.__meta.key = key
    }

    val.key = key

    let watched = val.watch
    let l
    if (watched && (l = watched.length)) {
      for (let i = 0; i < l; i ++) {
        let p = watched[i]
        meta.computed[p] = meta.computed[p] || []
        meta.computed[p].push(key)
      }
    }

    val.didChange = function () {
      obj.propertyDidChange(key)
    }

    if (meta.isInitialized) {
      console.log('defineProperty')
      defineProperty(obj, key, val)
    }

    return val
  },

  /***********************************************************************
  Get the value of a property.

  This is identical to doing `obj.key` or `obj[key]`,
  unless you are supporting <= IE8.

  @method get
  @param {String} key The property to get.
  @return The value of the property or `undefined`.
  ***********************************************************************/
  get (key) {
    return get(this, key)
  },

  /***********************************************************************
  Set the value of a property.

  This is identical to doing `obj.key = val` or `obj[key] = val`,
  unless you are supporting <= IE8.

  You can also use this to set nested properties.
  I.e. `obj.set('some.nested.key', val)`

  @method set
  @param {String} key The property to set.
  @param val The value to set.
  @return The value returned from the property's setter.
  ***********************************************************************/
  set () {
    let args = Array.prototype.slice.call(arguments)
    args.unshift(this)
    return set.apply(null, args)
  },

  propertyDidChange (prop) {
    let meta = METAS.get(this)
    if (!meta.watchers.size) return
    if (~meta.changedProps.indexOf(prop)) return
    meta.changedProps.push(prop)
    notifyWatchers(this, meta)
  },

  /***********************************************************************
  Watch a property or properties for changes.
  ```javascript
  var obj = $b.Object.create({
      color : 'green',
      firstName : 'Joe',
      lastName : 'Schmoe',
      init  () {
          this.watch('color', this.colorChanged.bind(this));
          this.watch(['firstName', 'lastName'], this.nameChanged.bind(this));
      },
      colorChanged  () {
          console.log(this.color);
      },
      nameChanged  () {
          console.log(this.firstName + ' ' + this.lastName);
      }
  });
  obj.color = 'red';
  obj.firstName = 'John';
  obj.lastName = 'Doe';
  ```
  Watcher functions are only invoked once per Run Loop, this means that the `nameChanged`
  method above will only be called once, even though we changed two properties that
  `nameChanged` watches.
  You can skip the `props` argument to watch all properties on the Object.
  @method watch
  @param {null|String|Array} props The property or properties to watch.
  @param {Function} fn The function to call upon property changes.
  ***********************************************************************/
  watch (...args) {

    let fn = args[1]
    let props = args[0]

    if (typeof fn !== 'function') {
      fn = args.slice(args.length - 1, args.length)[0]
      props = args.length === 1 ? [] : expandProps(flatten[args.concat()])
    } else props = expandProps(props.concat())

    return watch(this, props, fn);
  },

  /***********************************************************************
  Remove a watcher.
  @method unwatch
  @param {Function|Array} fns The function(s) you no longer want to trigger on property changes.
  ***********************************************************************/
  unwatch (...args) {
    unwatch(this, ...args)
  },

  /***********************************************************************
  Remove all watchers watching properties this object.
  USE WITH CAUTION.
  This gets called automatically during `destroy()`, it's not very common
  you would want to call this directly.
  Any and all other objects that have bound properties,
  watchers or computed properties dependent on this Object instance will
  stop working.
  @method unwatchAll
  ***********************************************************************/
  unwatchAll () {
    unwatchAll(this)
  },

  /***********************************************************************
  Destroys an object, removes all bindings and watchers and clears all metadata.

  In addition to calling `destroy()` be sure to remove all
  references to the object so that it gets Garbage Collected.

  @method destroy
  ***********************************************************************/
  destroy (...args) {
    if (this.isDestroyed) return
    this.unwatchAll()
    METAS.delete(this)
    this.isDestroyed = true
    CoreObject.prototype.destroy.call(this, ...args)
  }
})

/***********************************************************************
Extends an object's prototype and creates a new subclass.

The new subclass will inherit all properties and methods of the Object being
extended.

```javascript

let Animal = $b.Object.extend({

    numLegs : 4,

    walk  () {
        for (let i = 1; i <= this.numLegs; i ++) {
            console.log('moving leg #' + i)
        }
    }
})

let Dog = Animal.extend({

    bark  () {
        console.log('woof!!')
    },

    walkAndBark  () {
        this.bark()
        this.walk()
    }
})

let doggy = Dog.create()
doggy.walkAndBark()

```

If you want `super()` method support, use {{#crossLink "decal.Class"}}{{/crossLink}}

```javascript

let Animal = $b.Class.extend({

    numLegs : 4,

    walk  () {
        for (let i = 1; i <= this.numLegs; i ++) {
            console.log('moving leg #' + i)
        }
    }
})

let Dog = Animal.extend({

    bark  () {
        console.log('woof!!')
    },

    walk  () {
        this._super()
        console.log('all ' + this.numLegs + ' legs moved successfully.')
    },

    walkAndBark  () {
        this.bark()
        this.walk()
    }
})

let doggy = Dog.create()
doggy.walkAndBark()

```

@method extend
***********************************************************************/
Obj.extend = function () {
  let SubObj = CoreObject.extend.apply(this, arguments)
  let proto = SubObj.prototype
  parsePrototype(proto)
  proto.constructor = SubObj
  return SubObj
}

Obj.meta = function () {
  let meta = METAS.get(this)
  if (!meta) {
    meta = {}
    METAS.set(this, meta)
  }
  return meta
}

module.exports = Obj
