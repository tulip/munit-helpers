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

MunitHelpers = undefined;
MunitHelpersInternals = undefined;

(function() {
    "use strict";

    var restoreAllFns = [];

    var RANDOM_ID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
    var RANDOM_ID_LENGTH = 17;

    MunitHelpersInternals = {
        onRestoreAll: function(fn) {
            restoreAllFns.push(fn);
        },

        // tests sometimes need to stub Random.id, so we don't depend on it
        // in MunitHelpers. Instead, we use this simple random string generator.
        randomId: function() {
            var str = "";
            for (var i = 0; i < RANDOM_ID_LENGTH; i++) {
                str += RANDOM_ID_CHARS[Math.floor(Math.random() * RANDOM_ID_CHARS.length)];
            }
            return str;
        }
    };

    MunitHelpers = {
        restoreAll: function() {
            restoreAllFns.forEach(function(fn) {
                fn();
            });
        }
    };

    // restoreAll should restore sinon stubs and spies
    MunitHelpersInternals.onRestoreAll(function() {
        stubs.restoreAll();
        spies.restoreAll();
    });
})();
