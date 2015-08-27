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

    var makeTestConnection = Package["test-helpers"].makeTestConnection;

    // we keep track of all open connections so we can clean them up. They're
    // keyed by a random ID>
    var conns = {};

    MunitHelpers.Connection = {
        // this is basically a wrapper around Meteor's makeTestConnection
        // we first wrap it so it has a normal node async interface (with
        // a single callback that provides an error and result), and then
        // wrap that with Meteor.wrapAsync so we can use it synchronously.
        create: Meteor.wrapAsync(function(callback) {
            var failureMessage;
            var connId = MunitHelpersInternals.randomId();

            var test = {
                isTrue: function(bool, message) {
                    if(!bool) {
                        failureMessage = message;
                        throw new Error("isTrue failure while establishing meteor connection");
                    }
                },

                message: function(message){
                    failureMessage = message;
                }
            };

            var successCallback = function(clientConn, serverConn) {
                conns[connId] = {
                    clientConn: clientConn,
                    serverConn: serverConn,
                    restore: function() {
                        clientConn.disconnect();
                        delete conns[connId];
                    }
                };

                callback(undefined, conns[connId]);
            };

            var failureCallback = function() {
                callback(failureMessage);
            };

            makeTestConnection(test, successCallback, failureCallback);
        }),

        stubLogin: function(conns, user) {
            var resetStubUser = MunitHelpers.Auth.stubUser(user);

            // mark the connection we created as being logged in as
            // the stub user, but save the old user so we can restore later
            var origUser = Meteor.server.sessions[conns.serverConn.id].userId;
            Meteor.server.sessions[conns.serverConn.id].userId = user._id;

            return function() {
                resetStubUser();

                if(Meteor.isServer && Meteor.server.sessions[conns.serverConn.id]) {
                    Meteor.server.sessions[conns.serverConn.id] = origUser;
                }
            };
        },

        restoreAll: function() {
            _.values(conns).forEach(function(conn) {
                conn.clientConn.disconnect();
            });

            conns = {};
        }
    };

    MunitHelpersInternals.onRestoreAll(function() {
        MunitHelpers.Connection.restoreAll();
    });
})();
