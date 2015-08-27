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

    var COLLECTION_METHODS = [
        "find",
        "findOne",
        "insert",
        "update",
        "upsert",
        "remove"
    ];

    // id -> restore function
    var stubs = {};

    MunitHelpers.Collections = {
        stub: function(collection, dontImportExisting) {
            if(!collection) {
                // we explicitly check for undefined collection so we don't
                // give the user an obscure error if they typo the name
                // of the collection.
                throw new Error("Undefined collection passed to MunitHelpers.Collections.stub");
            }

            // create a minimongo collection to act as the stub
            var stubCollection = new LocalCollection();
            stubCollection.name = collection._name;

            // import records from the real collection into the minimongo
            // collection
            if(!dontImportExisting) {
                collection.find().fetch().forEach(function(record) {
                    stubCollection.insert(record);
                });
            }

            // Stub all the methods on the real collection, and keep a handle
            // on their restore functions
            var stubRestoreFns = _.map(COLLECTION_METHODS, function(method) {
                var stubMethod = _.bind(stubCollection[method], stubCollection);

                return MunitHelpers.StubProperties.stub(collection, method, stubMethod);
            });

            // Also stub the _collection property that should point
            // to the underlying mongo collection on the server
            stubRestoreFns.push(
                MunitHelpers.StubProperties.stub(collection, "_collection", stubCollection)
            );

            // assign this stub an ID. Tag the collection with the ID
            var id = MunitHelpersInternals.randomId();
            stubRestoreFns.push(
                MunitHelpers.StubProperties.stub(collection, "_munitHelpersStubId", id)
            );

            // return a function that restores all the stubbed collection methods
            var restoreFn = function() {
                stubRestoreFns.forEach(function(restoreFn) {
                    restoreFn();
                });

                delete stubs[id];
            };

            // save the restore function, then return it
            stubs[id] = restoreFn;

            return restoreFn;

        },

        isStubbed: function(collection) {
            return !!(collection._munitHelpersStubId && stubs[collection._munitHelpersStubId]);
        },

        restore: function(collection) {
            if(MunitHelpers.Collections.isStubbed(collection)) {
                stubs[collection._munitHelpersStubId]();
            }
            else {
                throw "Tried to restore unstubbed collection";
            }
        },

        restoreAll: function() {
            _.each(_.values(stubs), function(restoreFn) {
                restoreFn();
            });
        }
    };

    MunitHelpersInternals.onRestoreAll(function() {
        // the actual restoration is handled by StubProperties's restoreAll.
        // we just need to clear the map of active stubs

        stubs = {};
    });
})();
