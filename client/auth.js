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

    _.extend(MunitHelpers.Auth, {
        stubLogin: function(userRecordOrId) {
            check(userRecordOrId, Match.OneOf(Object, String, null));

            var userRecord;
            var restoreUserStub;
            if(userRecordOrId) {
                // if we have a user record (as opposed to null), and it
                // doesn't have an id, add one.
                if(_.isString(userRecordOrId)) {
                    userRecord = Meteor.users.findOne({_id: userRecordOrId});
                }
                else {
                    userRecord = userRecordOrId;
                    if(!userRecord._id) {
                        userRecord._id = MunitHelpersInternals.randomId();
                    }

                    restoreUserStub = MunitHelpers.Auth.stubUser(userRecord);
                }

            }

            // save old stubs in case we're nested inside another stubLogin
            var oldUserStub = stubs.munitHelpersMeteorUser;
            var oldUserIdStub = stubs.munitHelpersMeteorUserId;

            // stub Meteor.user and Meteor.userId
            stubs.create("munitHelpersMeteorUser", Meteor, "user").returns(userRecord);
            stubs.create("munitHelpersMeteorUserId", Meteor, "userId").returns(userRecord._id);

            // stub Meteor.connection._userId
            var restoreConnectionUserIdStub = MunitHelpers.StubProperties.stub(Meteor.connection, "_userId", userRecord._id);
            Meteor.connection._userIdDeps.changed();

            return function() {
                // restore Meteor.user
                if(oldUserStub) {
                    stubs.munitHelpersMeteorUser = oldUserStub;
                    Meteor.user = oldUserStub;
                }
                else if(stubs.munitHelpersMeteorUser) {
                    stubs.restore("munitHelpersMeteorUser");

                }

                // restore Meteor.userId
                if(oldUserIdStub) {
                    stubs.munitHelpersMeteorUserId = oldUserIdStub;
                    Meteor.userId = oldUserIdStub;
                }
                else if(stubs.munitHelpersMeteorUserId) {
                    stubs.restore("munitHelpersMeteorUserId");
                }

                // restore Meteor.users
                if(restoreUserStub) {
                    restoreUserStub();
                }

                // restore Meteor.connection._userId
                restoreConnectionUserIdStub();
                Meteor.connection._userIdDeps.changed();
            };
        }
    });
})();
