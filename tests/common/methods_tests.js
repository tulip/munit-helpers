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
        name: "munit-helpers - Common - Methods",

        tearDown: MunitHelpers.restoreAll,

        suiteSetup: function() {
            if(Meteor.isClient) {
                delete Meteor.connection._methodHandlers.munitHelpersMethodsTestMethod;
                delete Meteor.connection._methodHandlers.munitHelpersMethodsTestMethodCreatesUser;
            }
            else {
                delete Meteor.server.method_handlers.munitHelpersMethodsTestMethod;
                delete Meteor.server.method_handlers.munitHelpersMethodsTestMethodCreatesUser;
            }

            Meteor.methods({
                munitHelpersMethodsTestMethod: function(arg) {
                    check(arg, {
                        ping: String
                    });

                    var response = { pong: arg.ping };

                    var user = Meteor.users.findOne(this.userId);
                    if(user) {
                        response.user = user;
                    }

                    return response;
                },

                munitHelpersMethodsTestMethodCreatesUser: function(expectedCurrentUserId) {
                    expect(this.userId).to.equal(expectedCurrentUserId);
                    expect(Meteor.users.findOne(expectedCurrentUserId)).to.be.ok;

                    return Meteor.users.insert({});
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
        },

        testApplyWithExistingUser: function() {
            var userRecord = {
                foo: "bar"
            };
            MunitHelpers.Auth.stubUser(userRecord);

            expect(MunitHelpers.Methods.apply(
                "munitHelpersMethodsTestMethod",
                [{
                    ping: "testmsg"
                }],
                userRecord._id
            )).to.deepMatch(
                {
                    pong: "testmsg",
                    user: userRecord,
                }
            );
        },

        testApplyWithMethodThatCreatesAUser: function() {
            MunitHelpers.Collections.stub(Meteor.users);

            var createdUserId = MunitHelpers.Methods.apply(
                "munitHelpersMethodsTestMethodCreatesUser",
                ["usertestid"],
                {
                    _id: "usertestid",
                }
            );

            // stubbed user should have been cleaned up, but not the user that was
            // created
            expect(Meteor.users.findOne("usertestid")).to.be.undefined;
            expect(Meteor.users.findOne(createdUserId)).to.not.be.undefined;
        }
    });
})();
