describe('hasMany', function () {
  let store, Post, User, Comment, Permission, emptyPostJSON, emptyCommentJSON

  before(function () {
    User = decal.Model.extend({
      modelKey: 'user',
      name: decal.attr()
    })

    Comment = decal.Model.extend({
      modelKey: 'comment',
      content: decal.attr(),
      author: decal.belongsTo('user'),
      views: decal.hasMany('user', {internal: true}),
      likes: decal.hasMany('user'),
      showTo: decal.hasMany('user', {embedded: true, readOnly: true})
    })

    Permission = decal.Model.extend({
      modelKey: 'permission',
      user: decal.belongsTo('user'),
      value: decal.attr(),

      canRead: decal.computed(function () {
        return this.get('value') >= 1
      }, ['value']),

      canWrite: decal.computed(function () {
        return this.get('value') >= 2
      }, ['value']),

      canDelete: decal.computed(function () {
        return this.get('value') >= 3
      }, ['value'])
    })

    Post = decal.Model.extend({
      modelKey: 'post',
      content: decal.attr(),
      author: decal.belongsTo('user'),
      comments: decal.hasMany('comment', {embedded: true}),
      likes: decal.hasMany('user'),
      views: decal.hasMany('user', {internal: true}),
      showTo: decal.hasMany('user', {readOnly: true}),
      permissions: decal.hasMany('permission', {
        map: {key: 'user', value: 'value'},
        internal: true
      })
    })
  })

  beforeEach(function () {
    store = decal.Store.create()
    emptyPostJSON = {
      comments: [],
      likes: [],
      views: [],
      permissions: {},
      showTo: [],
      author: null
    }

    emptyCommentJSON = {
      likes: [],
      showTo: [],
      views: [],
      author: null
    }
    store.addModels(Post, User, Comment, Permission)
  })

  afterEach(function () {
    store.destroy(true)
  })

  after(function () {})

  it('should properly deserialize and serialize hasManys.', function () {
    let users = []

    for (let i = 1; i <= 5; i++) {
      let user = User.create({id: i, name: 'User #' + i})
      store.add('user', user)
      users.push(user)
    }

    let json = {
      content: 'post....',
      likes: [3, 2, 5]
    }

    let post = Post.create()
    store.add('post', post)
    post.deserialize(json)

    expect(post.likes.length).to.equal(3)

    expect(post.likes[0]).to.equal(users[2])
    expect(post.likes[1]).to.equal(users[1])
    expect(post.likes[2]).to.equal(users[4])

    expect(post.serialize()).to.deep.equal(decal.extend(emptyPostJSON, json))
  })

  it('should properly deserialize and serialize embedded hasManys.', function () {
    let json = {
      comments: [
        {content: 'comment 1'},
        {content: 'comment 2'},
        {content: 'comment 3'},
        {content: 'comment 4'},
        {content: 'comment 5'}
      ]
    }

    let post = Post.create()
    store.add('post', post)
    post.deserialize(json)

    expect(post.comments.length).to.equal(5)
    expect(post.comments[0].content).to.equal('comment 1')
    expect(post.comments[1].content).to.equal('comment 2')
    expect(post.comments[2].content).to.equal('comment 3')
    expect(post.comments[3].content).to.equal('comment 4')
    expect(post.comments[4].content).to.equal('comment 5')

    let expectation = decal.extend(emptyPostJSON, json)
    expectation.comments.forEach(function (v, k, a) {
      a[k] = decal.extend({}, emptyCommentJSON, v)
    })

    expect(post.serialize()).to.deep.equal(expectation)
  })

  it('should properly deserialize and serialize mapped hasManys.', function () {
    let users = []

    for (let i = 1; i <= 5; i++) {
      let user = User.create({id: 'user' + i, name: 'User #' + i})
      store.add('user', user)
      users.push(user)
    }
    // Simple permissions. 0 = none, 1 = read, 2 = write, 3 = delete

    let json = {
      permissions: {
        'user1': 0,
        'user2': 1,
        'user3': 2,
        'user4': 3
      }
    }

    let post = Post.create()
    store.add('post', post)
    post.deserialize(json)

    expect(post.permissions.length).to.equal(4)
    expect(post.permissions[1].user).to.equal(users[1])

    expect(post.permissions[0].canRead).to.equal(false)
    expect(post.permissions[0].canWrite).to.equal(false)
    expect(post.permissions[0].canDelete).to.equal(false)

    expect(post.permissions[3].canRead).to.equal(true)
    expect(post.permissions[3].canWrite).to.equal(true)
    expect(post.permissions[3].canDelete).to.equal(true)

    expect(post.serialize()).to.deep.equal(decal.extend(emptyPostJSON, json))
  })

  it('should properly deserialize and serialize complex relationships.', function () {
    for (let i = 1; i <= 5; i++) store.add('user', User.create({id: i, name: 'User #' + i}))

    let json = {
      author: 1,
      content: 'post...',
      comments: [
        {content: 'comment 1', author: 1, likes: [3, 2, 5]},
        {content: 'comment 2', author: 2},
        {content: 'comment 3', author: 3, likes: [2]},
        {content: 'comment 4', author: 4},
        {content: 'comment 5', author: 5, likes: [1, 5]}
      ],
      likes: [1, 3]
    }

    let post = Post.create()
    store.add('post', post)
    post.deserialize(json)

    expect(post.comments[2]).to.be.an.instanceOf(Comment)
    expect(post.comments[2].author).to.be.an.instanceOf(User)
    expect(post.comments[0].likes[0]).to.be.an.instanceOf(User)

    let expectation = decal.extend(emptyPostJSON, json)
    expectation.comments.forEach(function (v, k, a) {
      a[k] = decal.extend({}, emptyCommentJSON, v)
    })

    expect(post.serialize()).to.deep.equal(expectation)
  })

  it('should properly deserialize and serialize complex relationships with filters.', function () {
    for (let i = 1; i <= 5; i++) store.add('user', User.create({id: i, name: 'User #' + i}))

    let json = {
      author: 1,
      content: 'post...',
      comments: [
        {content: 'comment 1', author: 1, likes: [3, 2, 5]},
        {content: 'comment 2', author: 2},
        {content: 'comment 3', author: 3, likes: [2]},
        {content: 'comment 4', author: 4, showTo: [{name: 'ralph'}]},
        {content: 'comment 5', author: 5, likes: [1, 5], views: [1, 5]}
      ],
      likes: [1, 3],
      views: [1, 5],
      showTo: [],
      permissions: {
        'user1': 0,
        'user2': 1,
        'user3': 2,
        'user4': 3
      }

    }

    Post.likes = decal.hasMany('user', {internal: true})

    let post = Post.create()
    store.add('post', post)
    post.deserialize(json, false, function (meta) {
      return !meta.opts.readOnly
    })

    post.comments[3].showTo.push(User.create({name: 'bart'}))

    expect(post.serialize(meta => !meta.opts.internal)).to.deep.equal({
      author: 1,
      content: 'post...',
      comments: [
        {content: 'comment 1', author: 1, likes: [3, 2, 5], showTo: []},
        {content: 'comment 2', author: 2, likes: [], showTo: []},
        {content: 'comment 3', author: 3, likes: [2], showTo: []},
        {content: 'comment 4', author: 4, likes: [], showTo: [{name: 'bart'}]},
        {content: 'comment 5', author: 5, likes: [1, 5], showTo: []}
      ],
      likes: [1, 3],
      showTo: []
    })
  })

  it('should properly revert hasManys.', function () {
    for (let i = 1; i <= 5; i++) store.add('user', User.create({id: i, name: 'User #' + i}))

    let json = {
      author: 1,
      content: 'post...',
      comments: [
        {content: 'comment 1', author: 1, likes: [3, 2, 5]},
        {content: 'comment 2', author: 2},
        {content: 'comment 3', author: 3, likes: [2]},
        {content: 'comment 4', author: 4},
        {content: 'comment 5', author: 5, likes: [1, 5]}
      ],
      likes: [1, 3]
    }

    let post = Post.create()
    store.add('post', post)
    post.deserialize(json)

    post.comments[0].content = 'dasfsafsdafa'

    let originalSerialized = decal.extend(emptyPostJSON, json)
    originalSerialized.comments.forEach(function (v, k, a) {
      a[k] = decal.extend({}, emptyCommentJSON, v)
    })

    expect(post.serialize()).to.not.deep.equal(originalSerialized)

    post.revert()
    expect(post.serialize()).to.deep.equal(originalSerialized)
  })
})
