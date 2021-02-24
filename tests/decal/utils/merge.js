describe('merge', function () {
  it('should properly defense Prototype Pollution', function () {
    let a = {}
    let b = JSON.parse('{"__proto__": {"pollute": "1"}}')
    decal.merge(a, b, true)
    let c = {}
    expect(c.pollute).to.not.equal('1')
  })
})
