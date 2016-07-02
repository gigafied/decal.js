const TestObj = require('./TestObj')

describe('construction', function () {

    it('should run the init method', function () {

        var Obj,
            instance;

        Obj = TestObj.extend({

            a : 'test',

            init : function () {
                this.initialized = true;
            }
        });

        instance = Obj.extend({}).create();

        expect(instance.initialized).to.be.ok;

        instance.destroy();
    });

    it('should be an instance of it\'s parent Classes', function () {

        var Obj,
            instance;

        Obj = TestObj.extend({})

        instance = Obj.extend({}).create();

        expect(instance).to.be.an.instanceof(Obj);
        expect(instance).to.be.an.instanceof(TestObj);
        expect(instance).to.be.an.instanceof(decal.Object);

        instance.destroy();
    });

});
