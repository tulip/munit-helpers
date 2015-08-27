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
        name: "Munit Helpers Methods Tests",

        tearDown: MunitHelpers.restoreAll,

        suiteSetup: function() {
            delete Meteor.server.method_handlers.munitHelpersMethodsTestMethod;

            Meteor.methods({
                munitHelpersMethodsTestMethod: function(arg) {
                    check(arg, {
                        ping: String
                    });

                    return {
                        pong: arg.ping,
                        user: Meteor.users.findOne(this.userId)
                    };
                }
            });
        },

        testApplyNoUser: function() {
            expect(MunitHelpers.Methods.apply(
                "munitHelpersMethodsTestMethod",
                [{ ping: "testmsg" }]
            )).to.deep.equal(
                { pong: "testmsg" }
            );
        },

        testApplyWithUser: function() {
            expect(MunitHelpers.Methods.apply(
                "munitHelpersMethodsTestMethod",
                [{
                    ping: "testmsg"
                }],
                {
                    _id: "usertestid",
                    userthing: "uservalue"
                }
            )).to.deep.equal(
                {
                    pong: "testmsg",
                    user: {
                        _id: "usertestid",
                        userthing: "uservalue"
                    }
                }
            );
        }
    });
})();
