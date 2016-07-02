'use strict'

module.exports = {
  // core
  Array:                require('./core/Array'),
  Class:                require('./core/Class'),
  CoreObject:           require('./core/CoreObject'),
  Object:               require('./core/Object'),

  // data
  Adapter:              require('./data/Adapter'),
  attr:                 require('./data/attr'),
  Collection:           require('./data/Collection'),
  Model:                require('./data/Model'),
  Store:                require('./data/Store'),

  // utils
  alias:                require('./utils/alias'),
  assert:               require('./utils/assert'),
  bindFunction:         require('./utils/bindFunction'),
  clone:                require('./utils/clone'),
  computed:             require('./utils/computed'),
  createDescriptor:     require('./utils/createDescriptor'),
  error:                require('./utils/error'),
  expandProps:          require('./utils/expandProps'),
  extend:               require('./utils/extend'),
  flatten:              require('./utils/flatten'),
  get:                  require('./utils/get'),
  getObjKeyPair:        require('./utils/getObjKeyPair'),
  intersect:            require('./utils/intersect'),
  isFunction:           require('./utils/isFunction'),
  isObject:             require('./utils/isObject'),
  merge:                require('./utils/merge'),
  params:               require('./utils/params'),
  set:                  require('./utils/set'),
  trim:                 require('./utils/trim'),
  unbound:              require('./utils/unbound'),
  warn:                 require('./utils/warn')
}