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
    MunitHelpers.Publications = {
        // wrapped version of runAsync
        run: function(pubName, user, args) {
            return Meteor.wrapAsync(function (pubName, user, args, callback) {
                var pub = MunitHelpers.Publications.runAsync(pubName, user, args, {
                    onReady: function () {
                        // if we immediately call the callback, .ready() might
                        // be false -- weird Meteor behavior. We use a setTimeout
                        // of 0 to avoid this.
                        Meteor.setTimeout(function() {
                            callback(undefined, pub);
                        }, 0);
                    },

                    onError: function (error) {
                        callback(error);
                    }
                });
            })(pubName, user || null, args || []);
        },

        runAsync: function(pubName, user, args, callbacks) {
            // create a connection
            var conns = MunitHelpers.Connection.create();

            // stub login
            if(user) {
                MunitHelpers.Connection.stubLogin(conns, user);
            }

            // make subscription
            var subArgs = [pubName].concat(args || []).concat(callbacks || function(){});
            var sub = conns.clientConn.subscribe.apply(conns.clientConn, subArgs);

            return {
                ready: _.bind(sub.ready, sub),

                stop: function() {
                    // stop the subscrption even though we later disconnect, so
                    // the user can test stop handlers in their publish function
                    sub.stop();

                    // clean up the connection
                    conns.restore();
                },

                collection: function(name) {
                    return new Mongo.Collection(name, {connection: conns.clientConn});
                }
            };
        }
    };
})();
