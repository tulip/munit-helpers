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

    // checks if an insert, update, or remove
    // action is permitted.
    //
    // collection: the collection to perform the action on
    // mongoMethodName: the name of the method on the underlying mongo collection
    //    that should be called
    // validatedMethodName: name of the method to be called on the meteor collection
    // args: array of args to pass to the validated method. Use id will be prepended
    // user: User record to stub a log in as.
    var actionPermitted = function(collection, mongoMethodName, validatedMethodName, args, user) {
        // log in
        var restoreStubUser;
        var userId = null;
        if(user) {
            restoreStubUser = MunitHelpers.Auth.stubUser(user);
            userId = user._id;
        }

        // stub method of underlying mongo collection
        var methodStub = sinon.stub(collection._collection, mongoMethodName);

        // perform the action, which checks allow/deny rules
        var success = false;

        try {
            collection[validatedMethodName].apply(collection, [userId].concat(args));
            success = true;
        }
        catch(err) {
            if((err instanceof Meteor.Error) && (err.error === 403) && (err.reason = "Access denied") ){
                success = false;
            }
            else {
                // an error other than an access denied happened.
                throw err;
            }
        }
        finally {
            // restore
            methodStub.restore();

            if(restoreStubUser) {
                restoreStubUser();
            }
        }

        return success && methodStub.calledOnce;
    };

    MunitHelpers.ACL = {
        insertPermitted: function(collection, doc, user) {
            return actionPermitted(
                collection,
                "insert",
                "_validatedInsert",
                [doc],
                user
            );
        },

        updatePermitted: function(collection, selector, mutator, user) {
            return actionPermitted(
                collection,
                "update",
                "_validatedUpdate",
                [selector, mutator],
                user
            );
        },

        removePermitted: function(collection, selector, user) {
            return actionPermitted(
                collection,
                "remove",
                "_validatedRemove",
                [selector],
                user
            );
        },

        adminPermitted: function(collection) {
            var undoCollectionStub = MunitHelpers.Collections.stub(collection);

            var getTestRecord = function() {
                // ACL testing can be destructive, so we get a fresh document
                // each time
                return {foo: "test"};
            };

            var testUpdate = {$set: {bar: "test2"}};

            var user = {
                admin: true,
                emails: [{address: "admin@example.com", verified: true}]
            };

            // insert
            var insertPermitted = MunitHelpers.ACL.insertPermitted(collection, getTestRecord(), user);

            // update
            var id = collection.insert(getTestRecord());
            var updatePermitted = MunitHelpers.ACL.updatePermitted(collection, id, testUpdate, user);

            // delete
            var removePermitted = MunitHelpers.ACL.removePermitted(collection, id, user);

            undoCollectionStub();

            return insertPermitted && updatePermitted && removePermitted;
        },

        nonAdminForbidden: function(collection) {
            var undoCollectionStub = MunitHelpers.Collections.stub(collection);

            var getTestRecord = function() {
                // ACL testing can be destructive, so we get a fresh document
                // each time
                return {foo: "test"};
            };

            var testUpdate = {$set: {bar: "test2"}};

            var user = {};

            // insert
            var insertForbidden = !MunitHelpers.ACL.insertPermitted(collection, getTestRecord(), user);

            // update
            var id = collection.insert(getTestRecord());
            var updateForbidden = !MunitHelpers.ACL.updatePermitted(collection, id, testUpdate, user);

            // delete
            var removeForbidden = !MunitHelpers.ACL.removePermitted(collection, id, user);

            undoCollectionStub();

            return insertForbidden && updateForbidden && removeForbidden;
        },

        onlyAdminPermitted: function(collection) {
            return MunitHelpers.ACL.adminPermitted(collection) &&
                   MunitHelpers.ACL.nonAdminForbidden(collection);
        }
    };
})();
