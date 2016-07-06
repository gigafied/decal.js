describe('serialize', function () {

    it('should properly serialize default values.', function (done) {

        var json,
            Model,
            expected,
            instance;

        Model = decal.Model.extend({
            a : decal.attr({defaultValue : 'a'}),
            b : decal.attr({defaultValue : 'b'}),
            c : decal.attr({defaultValue : 'c'})
        });

        instance = Model.create();

        expected = {a : 'a', b : 'b', c : 'c'};
        json = instance.serialize();

        expect(json).to.deep.equal(expected);

        done();
    });

    it('should properly serialize nested keys.', function (done) {

        var json,
            Model,
            expected,
            instance;

        Model = decal.Model.extend({
            a : decal.attr({key : 'a.b.c.d'})
        });

        instance = Model.create();
        instance.a = 'test';

        expected = {
            a : {
                b : {
                    c : {
                        d : 'test'
                    }
                }
            }
        };

        json = instance.serialize();
        expect(json).to.deep.equal(expected);

        done();
    });

    it('should properly serialize primary keys.', function (done) {

        var json,
            Model,
            expected,
            instance;

        Model = decal.Model.extend({
            primaryKey : 'uuid'
        });

        instance = Model.create();
        instance.pk = 'xxx';

        expected = {
            uuid : 'xxx'
        };

        json = instance.serialize();
        expect(json).to.deep.equal(expected);

        done();
    });

    it('should properly filter nested keys', function (done) {

        var json,
            Model,
            expected,
            instance;

        Model = decal.Model.extend({
            a : decal.attr({key : 'a.b.c.d', internal: true})
        });

        instance = Model.create();
        instance.a = 'test';

        expected = {
            a : {
                b : {
                    c : {
                        d : 'test'
                    }
                }
            }
        };

        json = instance.serialize(function (meta) {
            return !meta.opts.internal;
        });
        expect(json).to.deep.equal({});

        done();
    });
});
