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

    var expect = chai.expect;

    var collection = new Mongo.Collection("MunitHelpersTestCollection");
    var collectionRealFind = _.bind(collection._collection.find, collection._collection);

    var collection2 = new Mongo.Collection("MunitHelpersTestCollectionTwo");


    // we use this for BOTH setup and teardown, because of a known bug in
    // MunitHelpers that doesn't run teardown if the test failed, which can
    // make one failure cause many.
    var setup = function() {
        MunitHelpers.restoreAll();

        collection.find().forEach(function(record) {
            collection.remove(record._id);
        });
    };

    Munit.run({
        name: "Munit Helpers Collections Tests",

        setup: setup,
        tearDown: setup,

        testStub: function() {
            // stub the collection
            MunitHelpers.Collections.stub(collection);

            // test each method

            // insert
            var id = collection.insert({a: 10});
            expect(id).to.be.a("string");

            // find
            expect(collection.find({_id: id}).fetch()).to.deep.equal([
                { a: 10, _id: id }
            ]);

            // findOne
            expect(collection.findOne(id)).to.deep.equal({
                a: 10,
                _id: id
            });

            // remove
            collection.remove(id);
            expect(collection.find().fetch()).to.deep.equal([]);

            // upsert
            var ret = collection.upsert({foo: "bar"}, {$set: {
                b: 20
            }});

            expect(ret.numberAffected).to.equal(1);
            id = ret.insertedId;
            expect(id).to.be.a("string");

            // update
            collection.update({_id: id}, {$set: {
                c: 30
            }});
            expect(collection.findOne(id)).to.deep.equal({
                foo: "bar",
                b: 20,
                c: 30,
                _id: id
            });

            // make sure the original collection wasn't touched
            expect(collectionRealFind().fetch()).to.deep.equal([]);
        },

        // _collection and _ensureIndex should only be stubbed on the server
        // for real Mongo.Collections
        testStubMethodsThatDontExistForMinimongo: function() {
            var minimongoCollection = new LocalCollection();

            // stub the collection
            MunitHelpers.Collections.stub(minimongoCollection);

            // _collection
            expect(minimongoCollection).to.not.have.key("_collection");

            // _ensureIndex
            expect(minimongoCollection).to.not.have.key("_ensureIndex");
        },

        serverTestStubMethodsThatOnlyExistOnRealCollections: function() {
            MunitHelpers.Collections.stub(collection);
            var id = collection.insert({a: 10});

            // _collection
            expect(collection._collection.find({_id: id}).fetch()).to.deep.equal([{
                a: 10,
                _id: id
            }]);

            // _ensureIndex
            expect(collection._ensureIndex).to.be.a("function");
            expect(collection._ensureIndex).to.not.throw;
        },

        testStubImport: function() {
            // insert into the real collection
            collection.insert({_id: "a", a: 1});
            collection.insert({_id: "b", b: 2});

            // stub it and make sure we've imported
            MunitHelpers.Collections.stub(collection);
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "a", a: 1},
                {_id: "b", b: 2}
            ]);

            // change one of the records and make sure the real collection
            // isn't changd
            collection.update({_id: "a"}, {$set: {
                a: 5
            }});
            expect(collection.findOne("a").a).to.equal(5);
            expect(collectionRealFind({_id: "a"}).fetch()[0].a).to.equal(1);
        },

        testStubImportDisabled: function() {
            // insert into the real collection
            collection.insert({_id: "a", a: 1});

            // stub it and make sure we haven't imported
            MunitHelpers.Collections.stub(collection, true);
            expect(collection.find().fetch()).to.be.empty;
        },

        testStubUndefinedCollection: function() {
            expect(function() {
                MunitHelpers.Collections.stub(undefined);
            }).to.throw(/undefined collection/i);
        },

        testStubReturnRestore: function() {
            // insert into the real collection
            collection.insert({_id: "a", a: 1});

            // stub it and insert into the fake collection
            var restore = MunitHelpers.Collections.stub(collection);
            collection.insert({_id: "b", b: 2});
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "a", a: 1},
                {_id: "b", b: 2}
            ]);

            // restore and expect it to be back with just the real collection
            // insertion
            restore();
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "a", a: 1}
            ]);

            // expect insertions to operate on the real collection
            collection.insert({_id: "c", c: 3});
            expect(collectionRealFind({_id: "c"}).fetch()).to.deep.equal([
                {_id: "c", c: 3}
            ]);
        },

        testIsStubbed: function() {
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.false;

            // stub then restore with the returned function
            var restore = MunitHelpers.Collections.stub(collection);
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.true;

            restore();
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.false;

            // stub then restore with MunitHelpers.Collections.restore
            MunitHelpers.Collections.stub(collection);
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.true;

            MunitHelpers.Collections.restore(collection);
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.false;

            // stub then restore with MunitHelpers.Collections.restoreAll
            MunitHelpers.Collections.stub(collection);
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.true;

            MunitHelpers.Collections.restoreAll();
            expect(MunitHelpers.Collections.isStubbed(collection)).to.be.false;
        },

        testRestore: function() {
            // insert into the real collection
            collection.insert({_id: "a", a: 1});

            // stub it and insert into the fake collection
            MunitHelpers.Collections.stub(collection);
            collection.insert({_id: "b", b: 2});
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "a", a: 1},
                {_id: "b", b: 2}
            ]);

            // restore and expect it to be back with just the real collection
            // insertion
            MunitHelpers.Collections.restore(collection);
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "a", a: 1}
            ]);

            // expect insertions to operate on the real collection
            collection.insert({_id: "c", c: 3});
            expect(collectionRealFind({_id: "c"}).fetch()).to.deep.equal([
                {_id: "c", c: 3}
            ]);
        },

        testRestoreAll: function() {
            // stub both collections, insert, then restoreAll and make sure
            // there's nothing in the real collections
            MunitHelpers.Collections.stub(collection);
            MunitHelpers.Collections.stub(collection2);

            collection.insert({});
            collection2.insert({});

            expect(collection.find().count()).to.equal(1);
            expect(collection.find().count()).to.equal(1);

            MunitHelpers.Collections.restoreAll();

            expect(collection.find().count()).to.equal(0);
            expect(collection.find().count()).to.equal(0);
        },

        testStubNested: function() {
            // stub twice and make sure the nesting works correctly
            var restore1 = MunitHelpers.Collections.stub(collection);
            collection.insert({_id: "abcd", x: 1});

            var restore2 = MunitHelpers.Collections.stub(collection);
            collection.insert({_id: "efgh", y: 1});
            collection.update({_id: "abcd"}, {$set: {
                x: 2
            }});

            // make sure we have a collection that reflects all three of the
            // above operations
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "abcd", x: 2},
                {_id: "efgh", y: 1}
            ]);

            // restore once and make sure we go back to where we were before
            // the second stub
            restore2();
            expect(collection.find().fetch()).to.deep.have.members([
                {_id: "abcd", x: 1}
            ]);

            // restore again and make sure we're back to normal
            restore1();
            expect(collection.find().count()).to.equal(0);
        }
    });
})();
