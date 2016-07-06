/**
@class decal

Given an object and a 'nested property', return the sub-object and key name.

```javascript
let obj = {
    some : {
        nested : {
            key : 'test'
        }
    }
}

console.log(decal.getObjKeyPair(obj, 'some.nested.key')) // [ { key: 'test' }, 'key' ]
```

@method getObjKeyPair
@param {Object} The object containing the nested key.
@param {String} key The nested key.
@param {Boolean} [createIfNull=false] Whether to create objects for nested keys if the path would be invalid.
@return {Array} An `Array` of `[obj, unNestedKeyName]`
*/

'use strict'

const get = require('./get')

module.exports = function (obj, key, createIfNull) {
  key = key.split('.')

  for (let i = 0; i < key.length - 1; i++) {
    let val = get(obj, key[i])
    if (val == null && createIfNull) {
      val = obj[key[i]] = {}
    }
    obj = val
  }

  key = key.pop()

  return [obj, key]
}
