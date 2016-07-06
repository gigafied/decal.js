'use strict'

const TestClass = require('./TestClass')

describe('destruction', function () {
  it('should run the destroy method', function (done) {
    let Class = TestClass.extend({
      init: function () {
        this.initialized = true
      },

      unwatchAll: function () {
        this._super()
      },

      destroy: function () {
        this.x = this.y = this.z = null
        this.initialized = false

        expect(this.x).to.not.be.ok
        expect(this.y).to.not.be.ok
        expect(this.z).to.not.be.ok
        expect(this.initialized).to.not.be.ok

        this._super()

        done()
      }
    })

    let instance = Class.create()
    instance.destroy()
  })
})
