/*
Copyright 2014-2015 Tulip Interfaces, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/* jshint -W030 */

(function () {
    "use strict";

    var expect = chai.expect;

    Munit.run({
        name: "Munit Helpers StubProperties Tests",

        tearDown: MunitHelpers.restoreAll,

        // MunitHelpers.StubProperties.stub

        testStub: function() {
            var a = {b: 10};

            var restore = MunitHelpers.StubProperties.stub(a, "b", 20);
            expect(a.b).to.equal(20);

            restore();
            expect(a.b).to.equal(10);
        },

        testStubNested: function() {
            var a = {b: 10};

            var restore1 = MunitHelpers.StubProperties.stub(a, "b", 20);
            expect(a.b).to.equal(20);

            var restore2 = MunitHelpers.StubProperties.stub(a, "b", 30);
            expect(a.b).to.equal(30);

            var restore3 = MunitHelpers.StubProperties.stub(a, "b", 40);
            expect(a.b).to.equal(40);

            restore3();
            expect(a.b).to.equal(30);

            restore2();
            expect(a.b).to.equal(20);

            restore1();
            expect(a.b).to.equal(10);
        },

        testStubNestedWrongRestoreOrder: function() {
            var a = {b: 10};

            var restore1 = MunitHelpers.StubProperties.stub(a, "b", 20);
            expect(a.b).to.equal(20);

            MunitHelpers.StubProperties.stub(a, "b", 30);
            expect(a.b).to.equal(30);

            var restore3 = MunitHelpers.StubProperties.stub(a, "b", 40);
            expect(a.b).to.equal(40);

            restore3();
            expect(a.b).to.equal(30);

            expect(function() {
                restore1();
            }).to.throw("You tried to restore a stub, but it's been replaced with a different stub. Restore the new stub first.");
        },

        testStubRestoreTwice: function() {
            var a = {b: 10};

            var restore = MunitHelpers.StubProperties.stub(a, "b", 20);
            restore();

            expect(restore).to.throw("You tried to restore a stub that doesn't exist. Have you already restored it?");
        },

        // MunitHelpers.StubProperties.isStub

        testIsStub: function() {
            var a = {b: 10};
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.false;

            var restore1 = MunitHelpers.StubProperties.stub(a, "b", 20);
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.true;

            var restore2 = MunitHelpers.StubProperties.stub(a, "b", 30);
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.true;

            restore2();
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.true;

            restore1();
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.false;
        },

        // MunitHelpers.StubProperties.restore

        testRestore: function() {
            var a = {b: 10};

            MunitHelpers.StubProperties.stub(a, "b", 20);
            expect(a.b).to.equal(20);

            MunitHelpers.StubProperties.restore(a, "b");
            expect(a.b).to.equal(10);
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.false;
        },

        testRestoreNested: function() {
            var a = {b: 10};

            MunitHelpers.StubProperties.stub(a, "b", 20);
            expect(a.b).to.equal(20);

            MunitHelpers.StubProperties.stub(a, "b", 30);
            expect(a.b).to.equal(30);

            MunitHelpers.StubProperties.stub(a, "b", 40);
            expect(a.b).to.equal(40);

            MunitHelpers.StubProperties.restore(a, "b");
            expect(a.b).to.equal(30);

            MunitHelpers.StubProperties.restore(a, "b");
            expect(a.b).to.equal(20);

            MunitHelpers.StubProperties.restore(a, "b");
            expect(a.b).to.equal(10);
        },

        testRestoreNonexistant: function() {
            var a = {b: 10};

            expect(function() {
                MunitHelpers.StubProperties.restore(a, "b");
            }).to.not.throw;
        },

        testRestoreTooManyTimes: function() {
            var a = {b: 10};

            MunitHelpers.StubProperties.stub(a, "b", 20);
            MunitHelpers.StubProperties.stub(a, "b", 30);

            MunitHelpers.StubProperties.restore(a, "b");
            MunitHelpers.StubProperties.restore(a, "b");

            expect(function() {
                MunitHelpers.StubProperties.restore(a, "b");
            }).to.not.throw;
        },

        // MunitHelpers.StubProperties.restoreAll

        testRestoreAll: function() {
            var a = {b: 10};
            var x = {y: 100};

            // stub a.b twice and x.y once
            MunitHelpers.StubProperties.stub(a, "b", 20);
            MunitHelpers.StubProperties.stub(a, "b", 30);
            MunitHelpers.StubProperties.stub(x, "y", 200);

            // restore all
            MunitHelpers.StubProperties.restoreAll();
            expect(a.b).to.equal(10);
            expect(x.y).to.equal(100);
            expect(MunitHelpers.StubProperties.isStub(a, "b")).to.be.false;
            expect(MunitHelpers.StubProperties.isStub(x, "y")).to.be.false;
        }
    });
})();
