describe('trim', function () {
  it('should properly trim strings.', function () {
    let actual = decal.trim('     hello world     .   ')
    let expected = 'hello world     .'

    expect(actual).to.equal(expected)
  })
})
