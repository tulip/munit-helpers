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
        stubLogin: function(userRecord) {
            check(userRecord, Match.OneOf(Object, null));

            var id = null;
            if(userRecord) {
                // if we have a user record (as opposed to null), and it
                // doesn't have an id, add one.
                if(!userRecord._id) {
                    userRecord._id = MunitHelpersInternals.randomId();
                }

                id = userRecord._id;
            }

            // stub the user
            var restoreUserStub;
            if(userRecord) {
                restoreUserStub = MunitHelpers.Auth.stubUser(userRecord);
            }

            // save old stubs in case we're nested inside another stubLogin
            var oldUserStub = stubs.munitHelpersMeteorUser;
            var oldUserIdStub = stubs.munitHelpersMeteorUserId;

            // stub Meteor.user and Meteor.userId
            stubs.create("munitHelpersMeteorUser", Meteor, "user").returns(userRecord);
            stubs.create("munitHelpersMeteorUserId", Meteor, "userId").returns(id);

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
            };
        }
    });
})();
