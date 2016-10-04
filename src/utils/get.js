/**
@class decal

Get a property or nested property on an object. Works on POJOs as well
as `decal.Object` instances.

```javascript
let obj = {
    test : 'test',
    some : {
        nested : {
            key : 'test2'
        }
    }
}

console.log(decal.get(obj, 'test')); // 'test'
console.log(decal.get(obj, 'some.nested.key')); // 'test2'
```

@method get
@param {Object} The object containing the property.
@param {String} key The property or nested property to get.
@return {Any} The value of the property.
*/

'use strict'

const CoreObject = require('../core/CoreObject')

module.exports = function (obj, key) {
  key = key.split('.')
  for (let i = 0; i < key.length; i++) {
    let k = key[i]
    if (!obj) return null
    if (obj instanceof CoreObject) {
      if (obj.isDestroyed) return null
      let meta = obj.__meta
      if (meta.getters[k]) obj = meta.getters[k].call(obj, k)
      else if (global.DECAL_WATCH_ENABLED) obj = meta.values[k]
      else obj = obj[k]
    } else obj = obj[k]
  }
  return obj
}
