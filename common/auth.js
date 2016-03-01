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

    MunitHelpers.Auth = {
        stubUser: function(userRecord) {
            check(userRecord, Object);

            //  stub Meteor.users if it's not already stubbed
            var restoreCollectionStub;
            if(!MunitHelpers.Collections.isStubbed(Meteor.users)) {
                restoreCollectionStub = MunitHelpers.Collections.stub(Meteor.users);
            }

            var insertedId;
            if (userRecord._id) {
                var fieldsToSet = EJSON.clone(userRecord);
                delete fieldsToSet._id;

                var result = Meteor.users.upsert(
                    { _id: userRecord._id },
                    { $set: fieldsToSet }
                );

                insertedId = result.insertedId;
            }
            else {
                insertedId = Meteor.users.insert(userRecord);
            }

            // store the id back in userRecord
            if (insertedId) {
                userRecord._id = insertedId;
            }


            return function() {
                // first, remove the user, in case the stub was a no-op
                if (insertedId) {
                    Meteor.users.remove(insertedId);
                }

                // call the restoration function for the collection
                if(restoreCollectionStub) {
                    restoreCollectionStub();
                }
            };
        }
    };
})();
