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

    // Map of id -> {object: <object>, property: <string>, originalValue: <any>, id: <string>}
    var stubs = {};

    // Map of id -> {<stub object>} for all stubs that have been replaced by
    // another stub. We use this to detect when a parent stub is restored before
    // its replacement, so we can provide a helpful error.
    var parentStubs = {};

    var restore = function(id) {
        var stub = stubs[id];

        if(!stub) {
            if(parentStubs[id]) {
                throw new Error("You tried to restore a stub, but it's been replaced with a different stub. Restore the new stub first.");
            }
            else {
                throw new Error("You tried to restore a stub that doesn't exist. Have you already restored it?");
            }
        }

        stub.object[stub.property] = stub.originalValue;
        delete stubs[id];

        // if this stub had a parent, put that one back in pace
        if(stub.parentStubId) {
            stubs[stub.parentStubId] = parentStubs[stub.parentStubId];
            delete parentStubs[stub.parentStubId];
        }
    };

    var findStub = function(object, property) {
        return _.find(stubs, function(stub) {
            return (stub.object === object) && (stub.property === property);
        });
    };

    MunitHelpers.StubProperties = {
        stub: function(object, property, value) {
            // we want to save the existing stub if there is one
            var parentStub = findStub(object, property);
            var parentStubId = parentStub ? parentStub.id : undefined;
            if(parentStubId) {
                // move the parent from stubs to parentStubs
                parentStubs[parentStubId] = parentStub;
                delete stubs[parentStubId];
            }

            // assign the stub and ID so we can access it later
            var id = MunitHelpersInternals.randomId();
            stubs[id] = {
                object: object,
                property: property,
                originalValue: object[property],
                id: id,
                parentStubId: parentStubId
            };

            // actually perform the stub
            object[property] = value;

            // return a restore function
            return function() {
                restore(id);
            };
        },

        isStub: function(object, property) {
            return !_.isUndefined(findStub(object, property));
        },

        restore: function(object, property) {
            var stub = findStub(object, property);
            if(stub) {
                restore(stub.id);
            }
        },

        restoreAll: function() {
            // we do this in a loop, because restoring stubs can put thier
            // parents back in pace
            while(_.size(stubs) > 0) {
                _.keys(stubs).forEach(restore);
            }
        }
    };

    MunitHelpersInternals.onRestoreAll(MunitHelpers.StubProperties.restoreAll);
})();
