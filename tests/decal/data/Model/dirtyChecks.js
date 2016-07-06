describe('isDirty/isClean', function () {
  it('should return isDirty === true and isClean === false on dirty properties.', function (done) {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 1})
    })

    let instance = Model.create()

    instance.a = 3

    expect(instance.isDirty).to.equal(true)
    expect(instance.isClean).to.equal(false)
    done()
  })

  it('should list all dirty properties in dirtyAttributes.', function (done) {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 1}),
      b: decal.attr({defaultValue: 2}),
      c: decal.attr({defaultValue: 3})
    })

    let instance = Model.create()

    instance.a = 3
    instance.b = 2
    instance.c = 1

    expect(instance.dirtyAttributes.toArray()).to.deep.equal(['a', 'c'])
    done()
  })

  it('should unflag dirty properties if they are no longer dirty.', function (done) {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 1}),
      b: decal.attr({defaultValue: 2}),
      c: decal.attr({defaultValue: 3})
    })

    let instance = Model.create()

    instance.a = 3
    instance.b = 2
    instance.c = 1

    expect(instance.isDirty).to.equal(true)
    expect(instance.isClean).to.equal(false)
    expect(instance.dirtyAttributes.toArray()).to.deep.equal(['a', 'c'])

    instance.a = 1
    instance.b = 2
    instance.c = 3

    expect(instance.dirtyAttributes.toArray()).to.deep.equal([])
    expect(instance.isDirty).to.equal(false)
    expect(instance.isClean).to.equal(true)

    instance.a = 5
    expect(instance.dirtyAttributes.toArray()).to.deep.equal(['a'])
    expect(instance.isDirty).to.equal(true)
    expect(instance.isClean).to.equal(false)

    done()
  })
})
