'use strict'

const TestClass = require('./TestClass')

describe('construction', function () {

    it('should run the init method', function (done) {

        var Class,
            instance;

        Class = TestClass.extend({

            init : function () {
                this.initialized = true;
            }
        });

        instance = Class.extend().create();

        expect(instance.initialized).to.be.ok;

        instance.destroy();
        done();
    });

    it('should run the __init() method before init()', function (done) {

        var Class,
            y = 0;

        Class = TestClass.extend({

            __init : function () {
                expect(y).to.equal(0);
                this._super();
                expect(y).to.equal(1);
            },

            init : function () {
                y = 1;
                done();
            }
        });

        Class.extend().create().destroy();
    });

    it('should be an instance of it\'s parent Classes', function (done) {

        var Class,
            instance;

        Class = TestClass.extend({});

        instance = Class.extend().create();

        expect(instance).to.be.an.instanceof(Class);
        expect(instance).to.be.an.instanceof(TestClass);
        expect(instance).to.be.an.instanceof(decal.Class);

        instance.destroy();
        done();
    });

});
