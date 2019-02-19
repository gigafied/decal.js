describe('belongsTo', function () {
  let store

  beforeEach(function () {
    store = decal.Store.create()
  })

  afterEach(function () {
    store.destroy(true)
  })

  it('should properly deserialize belongsTos.', function () {
    let Light = decal.Model.extend({
      modelKey: 'light',
      isOn: decal.attr({defaultValue: false})
    })

    let LightSwitch = decal.Model.extend({
      modelKey: 'lightSwitch',
      collectionKey: 'lightSwitches',
      light: decal.belongsTo('light'),

      flip: function () {
        this.light.isOn = !this.light.isOn
      }
    })

    let lightInstance = Light.create({id: 1})
    store.add('light', lightInstance)

    let switchInstance = LightSwitch.create()
    store.add('lightSwitch', switchInstance)

    switchInstance.deserialize({light: 1})

    expect(switchInstance.light).to.equal(lightInstance)
    expect(switchInstance.light.isOn).to.equal(false)
    switchInstance.flip()
    expect(switchInstance.light.isOn).to.equal(true)
  })

  it('should properly serialize belongsTos.', function () {
    let Light = decal.Model.extend({
      modelKey: 'light',
      isOn: decal.attr({defaultValue: false})
    })

    let LightSwitch = decal.Model.extend({
      modelKey: 'lightSwitch',
      collectionKey: 'lightSwitches',
      light: decal.belongsTo('light'),
      flip: function () {
        this.light.isOn = !this.light.isOn
      }
    })

    let lightInstance = Light.create({id: 1})
    store.add('light', lightInstance)

    let switchInstance = LightSwitch.create()
    store.add('lightSwitch', switchInstance)

    switchInstance.deserialize({
      light: 1
    })

    let json = switchInstance.serialize()
    expect(json).to.deep.equal({light: 1})
  })
})
