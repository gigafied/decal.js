describe('decal.Array', function () {

    before(function () {

    });

    it('should populate the content property on init', function () {

        var a;

        a = decal.Array.create(1, 2, 3);

        expect(a[0]).to.equal(1);
        expect(a[1]).to.equal(2);
        expect(a[2]).to.equal(3);
    });

    it('should properly concat', function () {

        var a,
            b;

        a = decal.Array.create(1, 2, 3);
        b = a.concat();

        expect(a).to.deep.equal(b);
    });

    it('should iterate with forEach', function () {

        var a,
            b;

        a = decal.Array.create(1, 2, 3);
        b = decal.Array.create();

        a.forEach(function (item) {
            b.push(item);
        });

        expect(a).to.deep.equal(b);
    });

    require('./mutations');
    require('./sorting');
    require('./find_filter');

    after(function () {

    });
});

