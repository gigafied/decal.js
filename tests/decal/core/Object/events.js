describe('events', function () {

    it('should be able to listen for events with on()', function () {

        var a,
            count = 0;

        a = decal.Object.create({});

        a.on('test', function (e) {
            count ++;
        });

        a.emit('test');
        a.emit('test');

        expect(count).to.equal(2);
        a.destroy();
    });

    it('should be able to unlisten for events with off()', function () {

        var a,
            fn,
            count = 0;

        a = decal.Object.create({});

        fn = function (e) {count ++;};

        a.on('test', fn);
        a.off('test', fn);

        a.emit('test');
        a.emit('test');

        expect(count).to.equal(0);
        a.destroy();
    });


    it('should be able to listen for events only one time with once()', function () {

        var a,
            count = 0;

        a = decal.Object.create({});

        a.once('test', function (e) {
            if (++count === 2) {
                a.destroy();
                done();
            }
        });

        a.emit('test');
        a.emit('test');

        expect(count).to.equal(1);
        a.destroy();
    });
});
