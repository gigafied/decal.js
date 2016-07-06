const TestObj = require('./TestObj')

describe('construction', function () {
  it('should run the init method', function () {
    let Obj = TestObj.extend({
      a: 'test',

      init: function () {
        this.initialized = true
      }
    })

    let instance = Obj.extend({}).create()
    expect(instance.initialized).to.be.ok
    instance.destroy()
  })

  it('should be an instance of it\'s parent Classes', function () {
    let Obj = TestObj.extend({})
    let instance = Obj.extend({}).create()

    expect(instance).to.be.an.instanceof(Obj)
    expect(instance).to.be.an.instanceof(TestObj)
    expect(instance).to.be.an.instanceof(decal.Object)

    instance.destroy()
  })
})
