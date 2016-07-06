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

  it('should properly deserialize embedded belongsTos.', function () {
    let Light = decal.Model.extend({
      modelKey: 'light',
      isOn: decal.attr({defaultValue: false})
    })

    let LightSwitch = decal.Model.extend({
      modelKey: 'lightSwitch',
      collectionKey: 'lightSwitches',
      light: decal.belongsTo('light', {embedded: true}),
      flip: function () {
        this.light.isOn = !this.light.isOn
      }
    })

    store.addModels(Light, LightSwitch)

    let switchInstance = LightSwitch.create()
    store.add('lightSwitch', switchInstance)

    switchInstance.deserialize({
      light: {
        isOn: true
      }
    })

    expect(switchInstance.light).to.be.an.instanceof(Light)
    expect(switchInstance.light.isOn).to.equal(true)
    switchInstance.flip()
    expect(switchInstance.light.isOn).to.equal(false)
  })

  it('should properly serialize embedded belongsTos.', function () {
    let Light = decal.Model.extend({
      modelKey: 'light',
      isOn: decal.attr({defaultValue: false})
    })

    let LightSwitch = decal.Model.extend({
      modelKey: 'lightSwitch',
      collectionKey: 'lightSwitches',
      light: decal.belongsTo('light', {embedded: true}),
      flip: function () {
        this.light.isOn = !this.light.isOn
      }
    })

    store.addModels(Light, LightSwitch)

    let switchInstance = LightSwitch.create()
    store.add('lightSwitch', switchInstance)

    switchInstance.deserialize({
      light: {
        isOn: true
      }
    })

    switchInstance.flip()

    let json = switchInstance.serialize()
    expect(json).to.deep.equal({light: {isOn: false}})
  })

  it('should allow filtering.', function () {
    let Light = decal.Model.extend({
      modelKey: 'light',
      isOn: decal.attr({defaultValue: false}),
      isDimmable: decal.attr({defaultValue: false, internal: true}),
      voltage: decal.attr({readOnly: true})
    })

    let LightSwitch = decal.Model.extend({
      modelKey: 'lightSwitch',
      collectionKey: 'lightSwitches',

      light: decal.belongsTo('light', {embedded: true}),
      linkedTo: decal.belongsTo('light', {embedded: true, readOnly: true}),
      linkedToNull: decal.belongsTo('light', {embedded: true, defaultValue: null}),

      flip: function () {
        this.light.isOn = !this.light.isOn
      }
    })

    store.addModels(Light, LightSwitch)

    let switchInstance = LightSwitch.create()
    store.add('lightSwitch', switchInstance)

    switchInstance.deserialize({
      light: {
        isOn: true,
        voltage: 1.2
      },
      linkedTo: {isOn: true, voltage: 123}
    }, false, function (meta) {
      return !meta.opts.readOnly
    })

    switchInstance.flip()
    expect(switchInstance.linkedTo).to.be.an.instanceOf(Light)
    expect(switchInstance.linkedToNull).to.equal(null)
    switchInstance.linkedTo = Light.create({voltage: 345})

    let json = switchInstance.serialize(function (meta) {
      return !meta.opts.internal
    })

    expect(json).to.deep.equal({
      light: {
        isOn: false
      },
      linkedTo: {
        isOn: false,
        voltage: 345
      },
      linkedToNull: null
    })
  })
})
