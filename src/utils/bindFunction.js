/**
@class decal

/***********************************************************************
Bind a function to a specific scope. Like `Function.prototype.bind()`. Does
not modify the original function.

```javascript

let obj = decal.Object.create({
    a : 'test'
})

function test () {
    console.log(this.a)
}

let boundTest = decal.bindFunction(test, obj)
boundTest() // test

```

@method bindFunction
@param {Function} fn The function to bind.
@param {decal.Object|decal.Class} The scope to bind to.
@return {Function} The bound version of the function.
*/

'use strict'

module.exports = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments)
  }
}
