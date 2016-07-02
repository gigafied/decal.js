'use strict'

const TestClass = require('./TestClass')

describe('destruction', function () {

    it('should run the destroy method', function (done) {

        var Class,
            instance;

        Class = TestClass.extend({

            init : function () {
                this.initialized = true;
            },

            unwatchAll : function () {
                this._super();
            },

            destroy : function () {

                var p;
                this.x = this.y = this.z = null;
                this.initialized = false;

                expect(this.x).to.not.be.ok;
                expect(this.y).to.not.be.ok;
                expect(this.z).to.not.be.ok;
                expect(this.initialized).to.not.be.ok;

                this._super();

                done();
            }
        });

        instance = Class.create();
        instance.destroy();
    });

});
