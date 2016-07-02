describe('mutations', function () {

    it('should allow pushing items with push()', function () {

        var a;

        a = decal.Array.create(1, 2, 3);
        expect(a.toArray()).to.deep.equal([1, 2, 3]);

        a.push(4, 5, 6);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow adding items with insertAt()', function () {

        var a;

        a = decal.Array.create(1, 2, 3);
        expect(a.toArray()).to.deep.equal([1, 2, 3]);

        a.insertAt(3, 4);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4]);

        a.destroy();
    });

    it('should allow removing items with remove()', function () {

        var a;

        a = decal.Array.create(1, 2, 3, 4, 5, 6);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.remove(3);
        expect(a.toArray()).to.deep.equal([1, 2, 4, 5, 6]);

        a.destroy();
    });

    it('should allow removing items with removeAt()', function () {

        var a;

        a = decal.Array.create(1, 2, 3, 4, 5, 6);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.removeAt(0);
        expect(a.toArray()).to.deep.equal([2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow removing items with pop()', function () {

        var a,
            b;

        a = decal.Array.create(1, 2, 3, 4, 5, 6);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);

        b = a.pop();

        expect(b).to.equal(6);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5]);

        a.destroy();
    });

    it('should allow removing items with shift()', function () {

        var a,
            b;

        a = decal.Array.create(1, 2, 3, 4, 5, 6);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);

        b = a.shift();

        expect(b).to.equal(1);
        expect(a.toArray()).to.deep.equal([2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow adding/removing items with splice()', function () {

        var a;

        a = decal.Array.create(1, 1, 1);
        expect(a.toArray()).to.deep.equal([1, 1, 1]);
        a.splice(1, 2, 2, 3, 4);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4]);

        a.destroy();
    });

    it('should allow adding items with unshift()', function () {

        var a;

        a = decal.Array.create(4, 5, 6);
        expect(a.toArray()).to.deep.equal([4, 5, 6]);
        a.unshift(1, 2, 3);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow replacing items', function () {

        var a;

        a = decal.Array.create(0, 2, 3);
        expect(a.toArray()).to.deep.equal([0, 2, 3]);

        a.replace(0, 1);
        expect(a.toArray()).to.deep.equal([1, 2, 3]);

        a.destroy();
    });

    it('should allow replacing with replaceAt()', function () {

        var a;

        a = decal.Array.create(1, 2, 3, 0);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 0]);

        a.replaceAt(3, 4);
        expect(a.toArray()).to.deep.equal([1, 2, 3, 4]);

        a.destroy();
    });

    it('should trigger added event on addition of items', function (done) {

        var a,
            changes;

        a = decal.Array.create(1, 2, 3);
        changes = [];

        a.on('add', function (item) {
            expect(item).to.equal(4);
            done();
        });

        a.push(4);
    });

    it('should trigger removed event on removal of items', function (done) {

        var a,
            changes;

        a = decal.Array.create(1, 2, 3);
        changes = [];

        a.on('remove', function (item) {
            expect(item).to.equal(2);
            done();
        });

        a.removeAt(1);
    });

    it('should bubble events from items in the array', function (done) {

        var a,
            b,
            c,
            count,
            triggered;

        a = decal.Object.create({test : 'a'});
        b = decal.Object.create({test : 'b'});
        c = decal.Object.create({test : 'c'});

        let arr = decal.Array.create(a, b, c);
        count = 0;
        triggered = [];

        arr.on('item.test', function (item) {

            triggered.push(item);

            if (++count === 3) {
                expect(triggered).to.have.members([a, b, c]);
                a.destroy();
                b.destroy();
                c.destroy();
                arr.destroy();
                done();
            }
        });

        a.emit('test');
        b.emit('test');
        c.emit('test');
    });
});
