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
        name: "munit-helpers - Common - DeepMatch",

        tearDown: MunitHelpers.restoreAll,

        testDiff: function() {
            // example taken from the deep-diff docs but with a function
            // matcher added
            var actual = {
                name: "my object",
                description: "it\'s an object!",
                details: {
                    it: "has",
                    an: "array",
                    with: ["a", "few", "elements"]
                },
                badNumberField: 5,
                goodNumberField: 15
            };

            var expected = {
                name: "updated object",
                description: "it\'s an object!",
                details: {
                    it: "has",
                    an: "array",
                    with: ["a", "few", "more", "elements", { than: "before" }]
                },
                goodNumberField: function(x) { return x > 10; },
                badNumberField: function(x) { return x > 10; }
            };

            expect(MunitHelpers.DeepMatch.diff(actual, expected)).to.deepMatch(
                [ { kind: "E",
                    path: [ "name" ],
                    lhs: "my object",
                    rhs: "updated object",
                    desc: "Expected name to be \"updated object\" but it was \"my object\"" },

                  { kind: "E",
                    path: [ "details", "with", 2 ],
                    lhs: "elements",
                    rhs: "more",
                    desc: "Expected details.with.2 to be \"more\" but it was \"elements\"" },

                  { kind: "A",
                    path: [ "details", "with" ],
                    index: 3,
                    item: {
                        kind: "N",
                        rhs: "elements",
                        desc: "Missing value at the top level: \"elements\"" },
                    desc: "Mismatch at details.with.3: Missing value at the top level: \"elements\"" },

                  { kind: "A",
                    path: [ "details", "with" ],
                    index: 4,
                    item: {
                        kind: "N",
                        rhs: { than: "before" },
                        desc: "Missing value at the top level: {\"than\":\"before\"}"},
                    desc:  "Mismatch at details.with.4: Missing value at the top level: {\"than\":\"before\"}"},

                  { kind: "M",
                    path: [ "badNumberField" ],
                    lhs: 5,
                    desc: "Function matcher didn't match at badNumberField" } ]
            );
        },

        testChai: function() {
            expect(function() {
                expect({x: 10}).to.deepMatch({x: 20});
            }).to.throw;

            expect(function() {
                expect({x: 10}).to.deepMatch({x: 10});
            }).to.not.throw;
        }
    });
})();
