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

    MunitHelpers.Methods = {
        apply: function(method, args, user) {
            if(!Meteor.connection._methodHandlers[method]) {
                throw new Error("No method stub for " + method);
            }

            if(_.isUndefined(args)) {
                args = [];
            }

            if(!_.isArray(args)) {
                // otherwise the caller gets a confusing "malformed method
                // invocation" from Meteor.
                throw new Error("non-array passed as args to MunitHelpers.Methods.apply");
            }

            // if we're running the method as a user, stub the user login
            var resetStubLogin;
            if(user) {
                resetStubLogin = MunitHelpers.Auth.stubLogin(user);
            }

            // actually run the method
            try {
                var errToReturn, resultToReturn;

                // construct a DDP invocation
                var invocation = new DDPCommon.MethodInvocation({
                    isSimulation: true,
                    userId: user ? user._id : null,
                    setUserId: function() { /* no-op */ },
                    randomSeed: _.bind(Random.id, Random)
                });

                // to avoid sending a real method call to the server, we pretend
                // to be inside a method call. We could just call
                // Meteor.connection._methodHandlers[method] directly, but then
                // nested method calls wouldn't be handled correctly.
                DDP._CurrentInvocation.withValue(invocation, function() {
                    // The callback will get called synchronously because
                    // Meteor thinks we're inside a simulation
                    Meteor.apply(method, args, function(err, result) {
                        errToReturn = err;
                        resultToReturn = result;
                    });
                });

                if(errToReturn) {
                    throw errToReturn;
                }
                else {
                    return resultToReturn;
                }
            }
            finally {
                // reset the stub user login
                if(resetStubLogin) {
                    resetStubLogin();
                }
            }
        }
    };
})();
