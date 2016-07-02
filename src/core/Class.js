'use strict'

const Obj = require('./Object')
const merge = require('../utils/merge')
const bindFunction = require('../utils/bindFunction')

function superfy (fn, superFn) {
  return function () {
    let tmp = this._super || null

    // Reference the prototypes method, as super temporarily
    this._super = superFn

    let r = fn.apply(this, arguments)

    // Reset _super
    this._super = tmp
    return r
  }
}

/*
If Function.toString() works as expected, return a regex that checks for `this._super`
otherwise return a regex that passes everything.
*/

let superRE = (/\bthis\._super\b/)
let thisRE = (/\bthis\b/)

let Class = Obj.extend({

  /***********************************************************************
  `decal.Class` provides several useful inheritance helpers
  and other utilities not found on `decal.Object`:

  - `this._super()` method support.

  - Automatically binds methods that use `this`.

  @class decal.Class
  @extends decal.Object
  @constructor
  ************************************************************************/
  __init: superfy(function () {
    this._super.apply(this, arguments)

    /*
        Auto-binding methods is very expensive as we have to do
        it every time an instance is created. It roughly doubles
        the time it takes to instantiate

        We auto-bind by default on $b.Class and only if the method uses `this`.
    */
    if (this.__boundMethods && this.__boundMethods.length) {
      for (let i = this.__boundMethods.length - 1; i >= 0; i--) {
        let p = this.__boundMethods[i]
        this[p] = bindFunction(this[p], this)
      }
    }

    return this
  }, Obj.prototype.__init),

  destroy: superfy(function () {
    return this._super.apply(this, arguments)
  }, Obj.prototype.destroy)
})

Class.buildPrototype = function (props) {
  let proto = Obj.buildPrototype.call(this, props)
  this.__boundMethods = this.__boundMethods || []

  for (let p in props) {
    let val = props[p]
    if (typeof val === 'function' && thisRE.test(val)) {
      if (!~p.indexOf('__')) this.__boundMethods.push(p)
      // this._super() magic, as-needed
      if (superRE.test(val)) proto[p] = superfy(val, this.prototype[p])
    }
  }

  return proto
}

module.exports = Class
