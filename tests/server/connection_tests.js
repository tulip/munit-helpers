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

    Munit.run({
        name: "Munit Helpers Connection Tests",

        tearDown: MunitHelpers.restoreAll,

        suiteSetup: function() {
            delete Meteor.server.method_handlers.munitHelpersConnectionTestMethod;

            Meteor.methods({
                munitHelpersConnectionTestMethod: function(arg) {
                    check(arg, {
                        ping: String
                    });

                    return {
                        pong: arg.ping,
                        user: Meteor.users.findOne(this.userId)
                    };
                }
            });
        },

        testConnection: function() {
            var conns = MunitHelpers.Connection.create();

            var result = conns.clientConn.call("munitHelpersConnectionTestMethod", {
                ping: "testmessage"
            });

            // test calling a method
            expect(result).to.deep.equal({
                pong: "testmessage"
            });

            // test that the server handle looks right
            expect(conns.serverConn.id).to.be.a("string");
        },

        testConnectionStubLogin: function() {
            var conns = MunitHelpers.Connection.create();

            MunitHelpers.Connection.stubLogin(conns, {
                _id: "fooid",
                field: "value"
            });

            var result = conns.clientConn.call("munitHelpersConnectionTestMethod", {
                ping: "testmessage"
            });

            // test calling a method
            expect(result).to.deep.equal({
                pong: "testmessage",
                user: {
                    _id: "fooid",
                    field: "value"
                }
            });
        },

        testConnectionRestoreAll: function() {
            var conns = MunitHelpers.Connection.create();

            MunitHelpers.Connection.restoreAll();
            expect(conns.clientConn.status().connected).to.be.false;
        }


    });
})();
