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

    MunitHelpers.configure({
        authorizationErrors: [ 403, "AuthorizationError" ]
    });

    Munit.run({
        name: "munit-helpers - Server - ACL",

        tearDown: MunitHelpers.restoreAll,

        testInsertPermitted: function() {
            var TestCollection = new Meteor.Collection(null);

            TestCollection.allow({
                insert: function(userId) {
                    return Meteor.users.findOne(userId).userFlag === "allow";
                }
            });

            TestCollection.deny({
                insert: function(userId, record) {
                    return record.recordFlag === "deny";
                }
            });

            expect(MunitHelpers.ACL.insertPermitted(TestCollection, {
                recordFlag: "allow"
            }, {
                userFlag: "allow"
            })).to.be.true;

            expect(MunitHelpers.ACL.insertPermitted(TestCollection, {
                recordFlag: "deny"
            }, {
                userFlag: "allow"
            })).to.be.false;

            expect(MunitHelpers.ACL.insertPermitted(TestCollection, {
                recordFlag: "allow"
            }, {
                userFlag: "deny"
            })).to.be.false;
        },

        testUpdatePermitted: function() {
            var TestCollection = new Meteor.Collection(null);

            TestCollection.allow({
                update: function(userId) {
                    return Meteor.users.findOne(userId).userFlag === "allow";
                }
            });

            TestCollection.deny({
                update: function(userId, record, fieldNames) {
                    return _.contains(fieldNames, "forbiddenField");
                }
            });


            TestCollection.insert({
                _id: "testid",
                foo: "bar",
                forbiddenField: "xxx"
            });

            // we CAN update foo
            expect(MunitHelpers.ACL.updatePermitted(TestCollection, {
                _id: "testid"
            }, {
                $set: {
                    foo: "baz"
                }
            }, {
                userFlag: "allow"
            })).to.be.true;

            // we CANNOT update forbidenField
            expect(MunitHelpers.ACL.updatePermitted(TestCollection, {
                _id: "testid"
            }, {
                $set: {
                    forbiddenField: "baz"
                }
            }, {
                userFlag: "allow"
            })).to.be.false;

            // we CANNOT update if we don't have the userFlag
            expect(MunitHelpers.ACL.updatePermitted(TestCollection, {
                _id: "testid"
            }, {
                $set: {
                    foo: "baz"
                }
            }, {
                userFlag: "deny"
            })).to.be.false;
        },


        testRemovePermitted: function() {
            var TestCollection = new Meteor.Collection(null);

            TestCollection.insert({
                _id: "allowedId",
                recordFlag: "allow"
            });

            TestCollection.insert({
                _id: "deniedId",
                recordFlag: "deny"
            });

            TestCollection.allow({
                remove: function(userId) {
                    return Meteor.users.findOne(userId).userFlag === "allow";
                }
            });

            TestCollection.deny({
                remove: function(userId, record) {
                    return record.recordFlag === "deny";
                }
            });


            expect(MunitHelpers.ACL.removePermitted(TestCollection, {
                _id: "allowedId"
            }, {
                userFlag: "allow"
            })).to.be.true;

            expect(MunitHelpers.ACL.removePermitted(TestCollection, {
                _id: "allowedId"
            }, {
                userFlag: "deny"
            })).to.be.false;

            expect(MunitHelpers.ACL.removePermitted(TestCollection, {
                 _id: "deniedId"
            }, {
                userFlag: "allow"
            })).to.be.false;
        },

        testErrors: function() {
            var TestCollection403 = new Meteor.Collection(null);
            var TestCollectionAuthorizationError = new Meteor.Collection(null);
            var TestCollectionOtherMeteorError = new Meteor.Collection(null);
            var TestCollectionOtherError = new Meteor.Collection(null);

            TestCollection403.allow({
                insert: function() { throw new Meteor.Error(403, "message"); }
            });

            TestCollectionAuthorizationError.allow({
                insert: function() { throw new Meteor.Error("AuthorizationError", "message"); }
            });

            TestCollectionOtherMeteorError.allow({
                insert: function() { throw new Meteor.Error("Something Else", "message"); }
            });

            TestCollectionOtherError.allow({
                insert: function() { throw new Error("A non-meteor error"); }
            });

            // test default config

            MunitHelpers.configure();

            expect(MunitHelpers.ACL.insertPermitted(TestCollection403, {}))
                .to.be.false;

            expect(function() {
                MunitHelpers.ACL.insertPermitted(TestCollectionAuthorizationError, {});
            }).to.throw("AuthorizationError");

            expect(function() {
                MunitHelpers.ACL.insertPermitted(TestCollectionOtherMeteorError, {});
            }).to.throw("Something Else");

            expect(function() {
                MunitHelpers.ACL.insertPermitted(TestCollectionOtherError, {});
            }).to.throw("A non-meteor error");

            // test custom config

            MunitHelpers.configure({
                authorizationErrors: [ 403, "AuthorizationError" ]
            });

            expect(MunitHelpers.ACL.insertPermitted(TestCollection403, {}))
                .to.be.false;

            expect(MunitHelpers.ACL.insertPermitted(TestCollectionAuthorizationError, {}))
                .to.be.false;

            expect(function() {
                MunitHelpers.ACL.insertPermitted(TestCollectionOtherMeteorError, {});
            }).to.throw("Something Else");

            expect(function() {
                MunitHelpers.ACL.insertPermitted(TestCollectionOtherError, {});
            }).to.throw("A non-meteor error");
        },
    });
})();
