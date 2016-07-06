describe('misc', function () {

    it('should return null for `pk` when `primaryKey` === null.', function () {

        var json,
            Model,
            expected,
            instance;

        Model = decal.Model.extend({
            primaryKey : null,
            a : decal.attr({defaultValue : 'a'}),
            b : decal.attr({defaultValue : 'b'}),
            c : decal.attr({defaultValue : 'c'})
        });

        instance = Model.create();
        expect(instance.pk).to.equal(null);
    });
});
