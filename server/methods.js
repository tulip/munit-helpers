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
        apply: function(method, args, userOrId) {
            if(!Meteor.server.method_handlers[method]) {
                throw new Error("No such method " + method);
            }

            if(_.isUndefined(args)) {
                args = [];
            }

            if(!_.isArray(args)) {
                // otherwise the caller gets a confusing "malformed method
                // invocation" from Meteor.
                throw new Error("non-array passed as args to MunitHelpers.Methods.apply");
            }

            // create a connection to the server
            var conns = MunitHelpers.Connection.create();

            // if we're running the method as a user, stub the user login
            var resetStubLogin;
            if(userOrId) {
                resetStubLogin = MunitHelpers.Connection.stubLogin(conns, userOrId);
            }

            // actually run the method
            try {
                return conns.clientConn.apply(method, args);
            }
            finally {
                // reset the stub user login
                if(resetStubLogin) {
                    resetStubLogin();
                }

                // close the connection
                conns.clientConn.close();
            }
        }
    };
})();
