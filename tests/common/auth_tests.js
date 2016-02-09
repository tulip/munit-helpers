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
        name: "munit-helpers - Common - Auth",

        tearDown: MunitHelpers.restoreAll,

        clientTestStubUserImplicitId: function() {
            var user = {
                foo: "bar"
            };

            MunitHelpers.Auth.stubUser(user);

            // ID should have been set
            expect(user._id).to.be.a("string");

            // Meteor.users should have been stubbed
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;

            // User should have been inserted
            expect(Meteor.users.findOne(user._id)).to.deep.equal({
                foo: "bar",
                _id: user._id
            });
        },

        clientTestStubUserExplicitId: function() {
            var user = {
                _id: "abcd",
                foo: "bar"
            };

            MunitHelpers.Auth.stubUser(user);

            // ID should have been set
            expect(user._id).to.equal("abcd");

            // Meteor.users should have been stubbed
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;

            // User should have been inserted
            expect(Meteor.users.findOne(user._id)).to.deep.equal({
                foo: "bar",
                _id: "abcd"
            });
        },

        clientTestStubUserRestore: function() {
            var user = {};

            var restore = MunitHelpers.Auth.stubUser(user);

            // Meteor.users should be stubbed and have the user
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(Meteor.users.findOne(user._id)).to.not.be.undefined;

            restore();

            // Meteor.users shouldn't be stubbed
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.false;
            expect(Meteor.users.findOne(user._id)).to.be.undefined;
        },

        clientTestStubUserNested: function() {
            var user1 = {};
            var user2 = {};

            var user1restore = MunitHelpers.Auth.stubUser(user1);
            var user2restore = MunitHelpers.Auth.stubUser(user2);

            // we should have both user 1 and user 2
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(Meteor.users.findOne(user1._id)).to.not.be.undefined;
            expect(Meteor.users.findOne(user2._id)).to.not.be.undefined;

            // restoring user 2 should leave Meteor.users stubbed and leave
            // user 1 alone
            user2restore();
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
            expect(Meteor.users.findOne(user1._id)).to.not.be.undefined;
            expect(Meteor.users.findOne(user2._id)).to.be.undefined;

            // restoring user 1 should un-stub the collection
            user1restore();
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.false;
            expect(Meteor.users.findOne(user1._id)).to.be.undefined;
            expect(Meteor.users.findOne(user2._id)).to.be.undefined;
        },

        clientTestStubUserAlreadyStubbed: function() {
            MunitHelpers.Collections.stub(Meteor.users);

            var user1 = { _id: "user1" };
            var user2 = { _id: "user2" };
            var stubUser = { _id: "stubUser" };

            expect(Meteor.users.find().count()).to.equal(0);

            // pre-existing user
            Meteor.users.insert(user1);
            expect(_.pluck(Meteor.users.find().fetch(), "_id")).to.have.members(
                ["user1"]
            );

            // stub
            var restore = MunitHelpers.Auth.stubUser(stubUser);
            expect(_.pluck(Meteor.users.find().fetch(), "_id")).to.have.members(
                ["user1", "stubUser"]
            );

            // insert another user
            Meteor.users.insert(user2);
            expect(_.pluck(Meteor.users.find().fetch(), "_id")).to.have.members(
                ["user1", "user2", "stubUser"]
            );

            // restoring should clean up just stubUser
            restore();
            expect(_.pluck(Meteor.users.find().fetch(), "_id")).to.have.members(
                ["user1", "user2"]
            );
            expect(MunitHelpers.Collections.isStubbed(Meteor.users)).to.be.true;
        }
    });
})();
