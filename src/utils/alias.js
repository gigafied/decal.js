/**
@class decal

Alias a property to another property on the object.

```javascript

let obj = decal.Object.create({
    a : 'test',
    b : decal.alias('a')
})

console.log(obj.a, obj.b); //test, test
this.b = 'test2'
console.log(obj.a, obj.b); // test2, test2

```

```javascript

let obj = decal.Object.create({a : 'test'})
obj.prop('b', decal.alias('a'))

console.log(obj.a, obj.b); // test, test

obj.b = 'test2'

console.log(obj.a, obj.b); // test2, test2

```

@method alias
@param {String} key The property to alias.
@return {ComputedProperty} A computed property with a getter/setter that references the alias.
*/

'use stict'

const computed = require('./computed')

module.exports = function (s) {
  return computed({
    watch: [s],

    get: function () {
      return this.get(s)
    },

    set: function (val) {
      return this.set(s, val)
    }
  })
}
