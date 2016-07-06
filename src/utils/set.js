/***********************************************************************
@class decal
************************************************************************/

'use strict'

const get = require('./get')
const error = require('./error')
const getObjKeyPair = require('./getObjKeyPair')
const CoreObject = require('../core/CoreObject')

/***********************************************************************
Set property/properties or a nested property on an `Object`. Works on POJOs as well
as `decal.Object` instances.

**Setting single properties:**

```javascript
var obj = {}

$b.set(obj, 'test', 'test')
$b.set(obj, 'some.nested.key', 'test2')

console.log(obj); // { test: 'test', some: { nested: { key: 'test2' } } }

```

**Setting multiple properties:**

```javascript
var obj = {}

$b.set(obj, {test : 'test', test2 : 'test2'})

console.log(obj); // { test: 'test', test2: 'test2' }

```

@method set
@param {Object} obj The object containing the property/properties to set.
@param {String|Object} key The name of the property to set.
If setting multiple properties, an `Object` containing key : value pairs.
@param {Any} [val] The value of the property.
@return {Object} The Object passed in as the first argument.
************************************************************************/

function set (obj, key, val, quiet, skipCompare) {
  let meta
  if (typeof key === 'string') {
    if (key.indexOf('.') > -1) {
      obj = getObjKeyPair(obj, key, true)
      key = obj[1]
      obj = obj[0]
    }

    if (!skipCompare && get(obj, key) === val) return false

    if (obj instanceof CoreObject) {
      meta = obj.__meta
      if (meta.setters[key]) meta.setters[key].call(obj, val, key)
      else meta.values[key] = val
      if (!quiet) obj.propertyDidChange(key)
    } else obj[key] = val

    return obj
  }

  else if (arguments.length === 2) {
    for (let i in key) set(obj, i, key[i], val, quiet)
    return obj
  }

  error('Tried to call `set` with unsupported arguments', arguments)
}

module.exports = set
