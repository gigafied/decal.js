'use strict'

const extend = require('../utils/extend')
const EventEmitter = require('events')

/**

`decal.CoreObject` is not meant to be used directly.
Instead, use {{#crossLink "decal.Object"}}{{/crossLink}} or {{#crossLink "decal.Class"}}{{/crossLink}}.

@class decal.CoreObject
@constructor
*/

class CoreObject extends EventEmitter {

  destroy (...args) {
    this.removeAllListeners()
  }

  off (event, listener) {
    return this.removeListener(event, listener)
  }
}

CoreObject.extend = function (...args) {
  if (arguments.length > 1) {
    let C = this
    for (let i = 0, l = args.length - 1; i < l; i++) C = C.extend(args[i])
    return C
  }

  let props = args[0]
  let proto = this.buildPrototype(props)

  function DecalObject (__decal__) {
    if (__decal__ !== '__decal__') throw new Error('Use Obj.create() to instantiate, not new Obj()')
    return this
  }

  DecalObject.prototype = proto
  extend(DecalObject, this, proto.statics || {})

  DecalObject.prototype.constructor = DecalObject

  return DecalObject
}

CoreObject.buildPrototype = function (props) {
  let Super = function () {}
  Super.prototype = this.prototype
  return extend(new Super(), props)
}

CoreObject.inject = function (p, v) {
  if (typeof p === 'object') extend(this.prototype, p)
  else this.prototype[p] = v
  return this
}

CoreObject.create = function () {
  let instance = new this('__decal__')
  let init = instance.__init || instance.init
  if (init) instance = init.apply(instance, arguments) || instance
  return instance
}

module.exports = CoreObject
