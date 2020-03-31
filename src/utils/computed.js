/**
@class decal

Create a computed property on a {{#crossLink "decal.Object"}}{{/crossLink}}
instance or subclass.

There are two ways to define computed properties, both methods are given below.

**METHOD 1:**
```javascript

let Person = decal.Object.extend({
    firstName : '',
    lastLame : '',
    fullName : decal.computed(function () {
        return this.firstName + ' ' + this.lastName
    }, ['firstName', 'lastName'], opts)
})

personInstance = Person.create({firstName : 'Jane', lastName : 'Doe'})
console.log(personInstance.fullName); // 'Jane Doe'

personInstance.lastName = 'Smith'
console.log(personInstance.fullName); // 'Jane Smith'

```
**METHOD 2:**
```javascript
let personInstance = decal.Object.create({
    firstName : 'Jane',
    lastName : 'Smith',
    fullName : decal.computed({

        watch : ['firstName', 'lastName'],

        get : function () {
            return [this.firstName, this.lastName].join(' ')
        },

        set : function (val) {
            val = val.split(' ')
            this.firstName = val[0]
            this.lastName = val[1] || ''
            return val.join(' ')
        }
    },
    opts : {
      description: 'Full name of this person',
      objType: String
    })
})

console.log(personInstance.fullName); // 'Jane Smith'
personInstance.fullName = 'John Doe'
console.log(personInstance.firstName, personInstance.lastName); // 'John', 'Doe'

```

You can use the second method with a getter AND setter, only a getter or only a setter.
The first method only allows supplying a getter.

The `watch` property is an array of properties that will cause this computed
property to return a new value. In the first method, these properties
can be specified after the getter.

If you just want getter/setter support for a property you can specify an
empty array for the `watch` property or not define it at all.

**METHOD 1:**
@method computed
@param {Function} fn The getter for the computed property.
@param {Array} watch The array of properties to watch.
@param {Object} opts Options for the computed property
@return {ComputedProperty}

**METHOD 2:**
@method computed
@param {Object} object The object containing the [set/get/watch] property.
@param {Object} opts Options for the computed property
@return {ComputedProperty}
*/

'use strict'

const isFunction = require('./isFunction')

module.exports = function (o) {
  if (isFunction(o)) {
    o = {
      watch: arguments[1],
      get: o,
      __meta: {
        opts: arguments[2]
      }
    }
  } else {
    o.__meta = {
      opts: arguments[1]
    }
  }

  if (typeof o.value === 'undefined') {
    o.value = o.defaultValue
  }

  o.watch = o.hasOwnProperty('watch') ? [].concat(o.watch) : []
  o.__isComputed = true

  o.meta = function (m) {
    if (typeof m !== 'undefined') {
      for (let p in m) o.__meta[p] = m[p]
    }
    return o.__meta
  }

  return o
}
