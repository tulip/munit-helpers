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


    // runs the client-side method stub that returns the current user's ID
    // returns the result
    var runTestMethod = function() {
        return MunitHelpers.Methods.apply("munitHelpersClientAuthTestMethod", []);
    };

    Munit.run({
        name: "munit-helpers - Client - Auth",

        suiteSetup: function() {
            // we define a client-side method stub so later we can test that
            // client-side stubs are getting the right user id

            delete Meteor.connection._methodHandlers.munitHelpersClientAuthTestMethod;
            Meteor.methods({
                munitHelpersClientAuthTestMethod: function() {
                    return this.userId;
                }
            });
        },

        tearDown: MunitHelpers.restoreAll,

        testStubLoginWithImplicitId: function() {
            // stub the login with a user that doesn't have an id.

            var userRecord = {
                foo: "bar"
            };

            MunitHelpers.Auth.stubLogin(userRecord);

            // check that an id was added and the stub was made
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(userRecord._id).to.be.a("string");
            expect(Meteor.users.findOne(userRecord._id)).to.deep.equal(userRecord);
            expect(Meteor.user()).to.deep.equal(userRecord);
            expect(Meteor.userId()).to.equal(userRecord._id);
            expect(runTestMethod()).to.equal(userRecord._id);
        },

        testStubLoginWithExplicitId: function() {
            // stub the login with a user that does have an id.

            var userRecord = {
                _id: "abcd",
                foo: "bar"
            };

            MunitHelpers.Auth.stubLogin(userRecord);

            // check that the id wasn't changed and the stub was made
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(userRecord._id).to.equal("abcd");
            expect(Meteor.users.findOne(userRecord._id)).to.deep.equal(userRecord);
            expect(Meteor.user()).to.deep.equal(userRecord);
            expect(Meteor.userId()).to.equal(userRecord._id);
            expect(runTestMethod()).to.equal(userRecord._id);
        },

        testStubLoginRestore: function() {
            // stub
            var userRecord = {
                foo: "bar"
            };

            var restore = MunitHelpers.Auth.stubLogin(userRecord);

            // restore
            restore();

            // verify
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.false;
            expect(Meteor.users.findOne(userRecord._id)).to.be.undefined;
            expect(Meteor.user()).to.be.null;
            expect(Meteor.userId()).to.be.null;
            expect(runTestMethod()).to.be.null;
        },

        testStubLoginRestoreAll: function() {
            // stub
            var userRecord = {
                foo: "bar"
            };

            MunitHelpers.Auth.stubLogin(userRecord);

            // restore
            MunitHelpers.restoreAll();

            // verify
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.false;
            expect(Meteor.users.findOne(userRecord._id)).to.be.undefined;
            expect(Meteor.user()).to.be.null;
            expect(Meteor.userId()).to.be.null;
            expect(runTestMethod()).to.be.null;
        },

        testStubLoginNestedRestore: function() {
            // stub once
            var userRecord1 = {
                foo: "bar"
            };

            var restore1 = MunitHelpers.Auth.stubLogin(userRecord1);

            // stub again
            var userRecord2 = {
                foo: "bar"
            };

            var restore2 = MunitHelpers.Auth.stubLogin(userRecord2);

            // verify
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(Meteor.users.findOne(userRecord2._id)).to.deep.equal(userRecord2);
            expect(Meteor.user()).to.deep.equal(userRecord2);
            expect(Meteor.userId()).to.equal(userRecord2._id);
            expect(runTestMethod()).to.equal(userRecord2._id);

            // restore once
            restore2();

            // verify
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(Meteor.users.findOne(userRecord2._id)).to.be.undefined;
            expect(Meteor.users.findOne(userRecord1._id)).to.deep.equal(userRecord1);
            expect(Meteor.user()).to.deep.equal(userRecord1);
            expect(Meteor.userId()).to.equal(userRecord1._id);
            expect(runTestMethod()).to.equal(userRecord1._id);

            // restore again
            restore1();

            // verify
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.false;
            expect(Meteor.users.findOne(userRecord1._id)).to.be.undefined;
            expect(Meteor.user()).to.be.null;
            expect(Meteor.userId()).to.be.null;
            expect(runTestMethod()).to.be.null;
        }
    });
})();
