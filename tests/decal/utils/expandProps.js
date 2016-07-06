describe('expandProps', function () {
  it('should properly expand properties.', function () {
    let actual = decal.expandProps('nested.prop1,prop2,prop3')
    let expected = ['nested', 'nested.prop1', 'nested.prop2', 'nested.prop3']

    expect(actual).to.deep.equal(expected)
  })
})
