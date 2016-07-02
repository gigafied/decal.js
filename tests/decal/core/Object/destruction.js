const TestObj = require('./TestObj')

describe('destruction', function () {

    it('should run the destroy method', function (done) {

        var Obj,
            instance;

        Obj = TestObj.extend({

            init : function () {
                this.initialized = true;
            },

            destroy : function () {

                var p;
                this.x = this.y = this.z = null;
                this.initialized = false;

                expect(this.x).to.not.be.ok;
                expect(this.y).to.not.be.ok;
                expect(this.z).to.not.be.ok;
                expect(this.initialized).to.not.be.ok;

                done();

                TestObj.prototype.destroy.call(this);
            }
        });

        instance = Obj.create();
        expect(instance.initialized).to.equal(true);
        instance.destroy();
        expect(instance.initialized).to.equal(false);
        expect(instance.isDestroyed).to.equal(true);

    });

    it('should not error on subsequent calls to destroy', function () {

        var Obj,
            instance;

        Obj = TestObj.extend({

        });

        instance = Obj.create();
        instance.destroy();
        instance.destroy();
        instance.destroy();
        instance.destroy();

        expect(instance.isDestroyed).to.equal(true);

    });
});
