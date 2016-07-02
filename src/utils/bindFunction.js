/***********************************************************************
@class decal
************************************************************************/

'use strict'

/***********************************************************************
Bind a function to a specific scope. Like `Function.prototype.bind()`. Does
not modify the original function.

```javascript

var obj = $b.Object.create({
    a : 'test'
})

function test () {
    console.log(this.a)
}

var boundTest = $b.bindFunction(test, obj)
boundTest() // test

```

@method bindFunction
@param {Function} fn The function to bind.
@param {decal.Object|decal.Class} The scope to bind to.
@return {Function} The bound version of the function.
************************************************************************/
// Faster than Function.prototype.bind in V8, not sure about others.

module.exports = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments)
  }
}
