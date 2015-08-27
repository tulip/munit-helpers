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

(function () {
    "use strict";

    var expect = chai.expect;

    Munit.run({
        name: "Munit Helpers Stub Date",

        tearDown: MunitHelpers.restoreAll,

        testStubAndReset: function() {
            var startTime = Date.now();

            // stub the date
            var restore = MunitHelpers.StubDate.stub(1234);

            // check that the date was correctly stubbed
            expect(Date.now()).to.equal(1234);
            expect(+(new Date())).to.equal(1234);

            // un-stub
            restore();

            // check that we're back to normal time (within 5 seconds of the
            // start of the test)
            expect(Date.now()).to.be.closeTo(startTime, 5000);
        },

        testStubNested: function() {
            var startTime = Date.now();

            // stub the date twice
            var restore1 = MunitHelpers.StubDate.stub(1234);
            var restore2 = MunitHelpers.StubDate.stub(5678);

            // we should have the second stubbed date
            expect(Date.now()).to.equal(5678);

            // restore once, we should have the first stubbed date
            restore2();
            expect(Date.now()).to.equal(1234);

            // restore again, we should have the original date
            restore1();
            expect(Date.now()).to.be.closeTo(startTime, 5000);
        },

        testSetTimeoutStillWorks: function(test, waitFor) {
            MunitHelpers.StubDate.stub(1234);

            // we wrap an empty function in waitFor to make this test
            // asynchronous. If setTimeout is broken, the test will time out.
            Meteor.setTimeout(waitFor(function(){}), 10);
        }
    });
})();
