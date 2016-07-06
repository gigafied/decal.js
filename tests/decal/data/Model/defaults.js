describe('defaults', function () {
  it('should populate records with default values.', function () {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 'a'}),
      b: decal.attr({defaultValue: 'b'}),
      c: decal.attr({defaultValue: 'c'})
    })

    let instance = Model.create()

    expect(instance.a).to.equal('a')
    expect(instance.b).to.equal('b')
    expect(instance.c).to.equal('c')

    instance.destroy()
  })

  it('should override defaults if values are specified.', function () {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 'a'}),
      b: decal.attr({defaultValue: 'b'}),
      c: decal.attr({defaultValue: 'c'})
    })

    let instance = Model.create({a: 'a2', b: 'b2'})

    expect(instance.a).to.equal('a2')
    expect(instance.b).to.equal('b2')
    expect(instance.c).to.equal('c')

    instance.destroy()
  })

  it('should not dirty records when using default values.', function () {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 'a'}),
      b: decal.attr({defaultValue: 'b'}),
      c: decal.attr({defaultValue: 'c'})
    })

    let instance = Model.create()
    expect(instance.isDirty).to.equal(false)
    instance.destroy()
  })
})
