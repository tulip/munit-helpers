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

    var RealCollectionTest = new Meteor.Collection("RealCollectionTest");

    Munit.run({
        name: "munit-helpers - Server - Publications",

        tearDown: MunitHelpers.restoreAll,

        suiteSetup: function() {
            delete Meteor.server.publish_handlers.munitHelpersTestPublication;
            delete Meteor.server.publish_handlers.RealCollectionTest;

            Meteor.publish("munitHelpersTestPublication", function(arg) {
                check(arg, Match.Optional({
                    ping: String
                }));

                this.added("PubTestCollection", "pubtestid", {
                    some: "thing",
                    pong: (arg || {}).ping
                });

                var user = Meteor.users.findOne(this.userId);
                if(user && user.canSeeSecrets) {
                    this.added("SecretCollection", "secretid", {});
                }

                this.ready();
            });

            RealCollectionTest.remove({});
            Meteor.publish("RealCollectionTest", function(arg) {
                return RealCollectionTest.find();
            });
        },

        testSubscribeNoSecrets: function() {
            // run with a user that doesn't get secrets and a "ping" argument
            var pub = MunitHelpers.Publications.run(
                "munitHelpersTestPublication",
                { canSeeSecrets: false },
                { ping: "testfield" }
            );

            expect(pub.ready()).to.be.true;
            expect(pub.collection("PubTestCollection").findOne("pubtestid")).to.deep.equal({
                _id: "pubtestid",
                some: "thing",
                pong: "testfield"
            });

            expect(pub.collection("SecretCollection").find().count()).to.equal(0);
        },

        testSubscribeWithSecrets: function() {
            // run with a user than can see secrets
            var pub = MunitHelpers.Publications.run(
                "munitHelpersTestPublication",
                { canSeeSecrets: true }
            );

            expect(pub.collection("SecretCollection").find().count()).to.equal(1);
        },

        testSubscribeDefaultArgs: function() {
            // run without any args, to test default arg handling
            var pub = MunitHelpers.Publications.run(
                "munitHelpersTestPublication"
            );

            expect(pub.collection("PubTestCollection").findOne("pubtestid")).to.deep.equal({
                _id: "pubtestid",
                some: "thing",
                pong: undefined
            });
        },

        testSubscribeMatchesCollectionName: function() {
            RealCollectionTest.insert({_id: "a", b: "c"});

            var pub = MunitHelpers.Publications.run(
                "RealCollectionTest"
            );

            expect(pub.collection("RealCollectionTest").findOne("a")).to.deepMatch({
                _id: "a",
                b: "c",
            });
        }
    });
})();
