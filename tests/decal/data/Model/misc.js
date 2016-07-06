describe('misc', function () {
  it('should return null for `pk` when `primaryKey` === null.', function () {
    let Model = decal.Model.extend({
      primaryKey: null,
      a: decal.attr({defaultValue: 'a'}),
      b: decal.attr({defaultValue: 'b'}),
      c: decal.attr({defaultValue: 'c'})
    })

    let instance = Model.create()
    expect(instance.pk).to.equal(null)
  })
})
