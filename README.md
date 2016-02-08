Munit Helpers
====================

[![Build Status](https://travis-ci.org/tulip/munit-helpers.svg?branch=master)](https://travis-ci.org/tulip/munit-helpers)

[![Code Climate](https://codeclimate.com/github/tulip/munit-helpers/badges/gpa.svg)](https://codeclimate.com/github/tulip/munit-helpers)

Munit Helpers is a suite of Meteor package-testing tools, integrated with the excellent [Munit](https://github.com/practicalmeteor/meteor-munit) unit testing framework.

Munit Helpers includes:

- Easy stubbing of authentication and collections.
- Easy rendering and testing of Blaze templates.
- Utilities for testing Meteor methods, publications and allow/deny rules.
- Clean, documented APIs wrapping the testing utilities in the [Meteor codebase itself](https://github.com/meteor/meteor/tree/devel/packages/test-helpers)
- A few other useful tools for testing Meteor apps and packages.

Who's Behind It
====================

Munit Helpers is maintained by Tulip. We're an MIT startup located in Boston, helping enterprises manage, understand, and improve their manufacturing operations. We bring our customers modern web-native user experiences to the challenging world of manufacturing, currently dominated by ancient enterprise IT technology. We work on Meteor web apps, embedded software, computer vision, and anything else we can use to introduce digital transformation to the world of manufacturing. If these sound like interesting problems to you, [we should talk](mailto:jobs@tulip.co).

Get Started
====================

To use Munit Helpers to test a package, just add `api.use(["tulip:munit-helpers"])` in your `Package.onTest` block.

Included Libraries
====================

The Munit Helpers implies the Munit package -- so by adding Munit Helpers, you'll automatically have access to the APIs the Munit provides:

- [Munit](https://github.com/practicalmeteor/meteor-munit): Friendly BDD and TDD interfaces to Meteor's built-in tinytest.
- [Sinon](http://sinonjs.org/): Spies stubs and mocks. In general, don't use the sinon API directly; use the [Meteor-Sinon](https://github.com/practicalmeteor/meteor-sinon) API instead, as it tracks what stubs you've made for easy catch-all clean-up.
- [Chai](http://chaijs.com/): an assertion library.
- [Sinon-Chai](https://github.com/domenic/sinon-chai): Sinon assertions for chai.


Munit Helpers additionally provides the excellent [Chai jQuery](https://github.com/chaijs/chai-jquery) library, which provides a number of chai assertions that you can make on jQuery objects.

API
====================

Configuration (Anywhere)
--------------------

##### `MunitHelpers.configure(configuration:Object)`

Sets MunitHelpers configuration options. Valid options:

- `authorizationErrors`: Array of errors that should be considered authorization
  errors when testing ACL. See `MunitHelpers.ACL` for details. Defaults to
  `[403]`.

Passing no arguments (instead of a configuration object) will reset the
configuration to the default configuration.

Restore All (Anywhere)
--------------------

##### `MunitHelpers.restoreAll()`
Restores all stubs created by any of the methods in `MunitHelpers`, plus stubs and spies created by `stubs.create()` and `spies.create` in Meteor-Sinon. This function can be passed in directly as the `tearDown` or `suiteTearDown` property of a test suite passed to `Munit.run`:



StubProperties (Anywhere)
--------------------

##### `MunitHelpers.StubProperties.stub(object:Object, property:String, value:Any) -> Function`

Sets `object[property]` to `value` and returns a function that restores the stub. Calling this function when the stub has already been restored will cause an error. The stubs can also be restored by calling `MunitHelpers.restoreAll()`.

This method is "nestable" -- if the property is already stubbed, that stub will be replaced with this one. When the new stub is restored, the old one will be put back in place, unless it's restored with `restoreAll`, which restores all stubs, even nested ones. Trying to restore the old stub before the new one is restored will cause an error.

##### `MunitHelpers.StubProperties.restore(object:Object, property:String, value:Any)`

Restores the stub of `property` on `object` if it exists. Does nothing if that property is not stubbed.

##### `MunitHelpers.StubProperties.isStub(object:Object, property:String) -> Boolean`

Returns whether the given property is stubbed.

##### `MunitHelpers.StubProperties.restoreAll()`

Restores all changes made by calls to `MunitHelpers.StubProperties.stub` Note that many of the other methods of Munit Helpers use `MunitHelpers.StubProperties` internally, so this will restore those stubs as well.


StubDate (Anywhere)
--------------------

##### `MunitHelpers.StubDate.stub(now:Number)`

Override the Javascript Date object to be a stubbed date at a fixed time. Call this again to change the time. Returns a function that restores the stub. The stub can also be restored by calling `MunitHelpers.restoreAll()`.

This method is an alternative to using [sinon's fake timers](http://sinonjs.org/docs/#clock) when you don't want to affect `setTimeout` and `setInterval`.

Collections (Anywhere)
--------------------

##### `MunitHelpers.Collections.stub(collection:Collection, dontImportExisting:Optional Boolean) -> Function`

Stubs all the methods of the given collection so they work with an in-memory minimongo collection instead of the real database. Imports all records from the real collection into the minimongo collection unless the second argument is set to true. Returns a function that undoes the stubbing. The stubs can also be restored by calling `MunitHelpers.restoreAll()`.

This function is idempotent; if you attempt to stub a collection that's already stubbed, this function will do nothing and return a function that does nothing.

##### `MunitHelpers.Collections.isStubbed(collection:Collection) -> Boolean`

Returns whether the given collection is stubbed.

##### `MunitHelpers.Collections.restore(collection:Collection)`

Restores the given collection. Throws an error if the collection is not stubbed. Equivalent to calling the function returned by `MunitHelpers.Collections.stub`.

##### `MunitHelpers.Collections.restoreAll()`

Restores all collections stubbed by `MunitHelpers.Collections.stub`.

Methods (Anywhere)
--------------------

##### `MunitHelpers.Methods.apply(method:String, args:Array, user:Optional Object or String)`

Runs the given method with the given arguments. Stubs a log-in of the given user if provided. Returns the return value of the method, or throws an error if the method throws an error.

On the client, this uses the client-side stub of the method. It does not actually call to the server. On the server, this uses the server-side version of the method. In both cases, it runs syncronously, returning a value instead of taking a callback.

WARNING: On the server, this internally uses `MunitHelpers.Connection.create`, which means it won't work with sinon's fake timers. It does work with `MunitHelpers.StubDate.stub`.

DeepMatch (Anywhere)
--------------------

##### `MunitHelpers.DeepMatch.diff(actual:Any, expected:Any)`

Deep-diffs `actual` and `expected`. Returns `undefined` if there are no
differences. Uses [deep-diff](https://github.com/flitbit/diff)
internally, with modifications to also provide human-readable difference
descriptions and support custom matching functions.

If there are differences, returns an array of differences. See the
[deep-diff documentation](https://github.com/flitbit/diff#simple-examples)
for details.

As an extension to the upstream library, each item of the array additionally
has a `desc` property with a human-readable description of the difference.

As an additional extension, the expected object may contain functions. A
field in `actual` is matched against a function in `expected` by calling that
function with the `actual` field as an argument, and checking whether the
function returns a truthy value. As an example, we could use `DeepMatch` to
check whether a particular field is a number greater than 10 with:

```javascript
    MunitHelpers.DeepMatch.expectEqual(actualObject, {
        someField: function(value) {
            return _.isNumber(value) && (value > 10);
        }
    });
```

and then `{ someField: 15 }` would return no differences, but `{ someField: 5 }`
would return the difference description:

```javascript
[
    {
        kind: "M",
        path: [ "someField" ],
        lhs: 5,
        desc: "Function matcher didn't match at someField"
    }
]
```

This function is also exposed as the `deepMatch` helper in chai, so you can
use `expect(actualObject).to.deepMatch(expectedObject)` in your tests. This
is a drop-in replacement for `expect(actualObject).to.deep.equal(expecteObject)`
that gives much better error messages.

Auth (Varies)
--------------------

##### `MunitHelpers.Auth.stubUser(userRecord:Object) -> Function` (Anywhere)

Stubs `Meteor.users` using `MunitHelpers.Colletions.stub` and inserts the given user record. If the given record does not have an `_id` field, one will be added. Returns a function that removes the given user from the stubbed `Meteor.users` collection, and then un-stubs `Meteor.users` if it was not stubbed before `stubUser` was called.

##### `MunitHelpers.Auth.stubLogin(userRecord:Object or String or Null) -> Function` (Client Only)

Stubs `Meteor.user` and `Meteor.userId` to return the given user (or null). If the given user isn't null and does not have an `_id` field, an `_id` field will be added. If the user record is a string (the ID of a user), it will stub the login without adding the user to the Meteor.users collection. Returns a function that can be called to restore the stubs. The stubs can also be restored by calling `MunitHelpers.restoreAll()`.


Templates (Client)
--------------------

##### `MunitHelpers.Templates.render(template:Template, data:Object) -> Function`

Given a template (e.g. `Template.fooBar`) and a data context, renders the template and returns a jQuery-like function that only searches within the rendered template.

WARNING: the function renders the template but does not attach the result to the DOM. This means that if your template uses the global `$` function to select elements within the template, it won't find anything. Instead, your template should use the template-scoped jQuery function. This function can be accessed as `this.$` in `created`, `rendered`, and `destroyed` callbacks; as `Template.instance().$` in helpers; and as `template.$` in event maps, where `template` is the second argument to the event handler. See the [Meteor Docs](https://docs.meteor.com/#/full/template_$) for more details. If you really need to use the global jQuery function, your test can use the return value of `render` to find the top-level element in your template, and then call `appendTo` to append it to the DOM, like this:

```javascript
var $ = MunitHelpers.Template.render(Template.myTemplate, {some: "data"});
$(".top-level-el").appendTo("body");
```

##### `MunitHelpers.Templates.renderLayout(layoutTemplate:Template, contentTemplate:Template, data:Object) -> Function`

Given an Iron Layout template, renders it with the content template as the main yield block, using the given data context. Returns a jQuery-like function that only searches within the rendered template. Munit Helpers has a weak dependency on `iron:layout`, so your app or package must require `iron:layout` for you to use this function.

##### `MunitHelpers.Templates.create(name:String, html:String) -> Template`

Given the name of a template and static HTML content for it, returns the new template. Useful for creating content templates to pass to `MunitHelpers.Templates.renderLayout`.

##### `MunitHelpers.Templates.restore(jquery:Function)`

Given the jQuery-like object returned by `MunitHelpers.Templates.render` or `MunitHelpers.Templates.renderLayout`, destroys the template to stop reactive updates.

##### `MunitHelpers.Templates.restoreAll()`

Restores all templates created by `MunitHelpers.Templates.render` or `MunitHelpers.Templates.renderLayout`.

ACL (Server Only)
--------------------

Utilities for testing whether DB operations would be permitted by the package's allow/deny rules. Each of these methods takes the collection to check, the arguments that would be passed to the call, and an optional user. If the user is provided, the allow/deny rules will be run with that user is logged in. These methods return true if the insert was permitted, false if it was forbidden, and raise an error if an allow or deny rule raises an error.

By default, if the ACL rule raises a `Meteor.Error` with the error `403`, Munit Helpers considers that a forbidden response, and returns `false` instead of re-raising the error. If your code base uses other errors to indicate a forbidden response, you can configure additional errors types to be treated as forbidden errors. For example, calling `MunitHelpers.configure({ authorizationErrors: [ 403, "AuthorizationError" ] })` will cause these ACL checks to return false if an ACL rule does a `throw new Meteor.Error("AuthorizationError", "SomeMessage")`.

Note that the insert/update/remove is not actually performed -- we stub out the method that would actually do that. If you want to have the collection contain documents (which you probably do when testing update/remove rules), you can stub the collection with `MunitHelpers.Collections.stub` before calling these methods.

##### `MunitHelpers.ACL.insertPermitted(collection, doc, user) -> Boolean`

##### `MunitHelpers.ACL.updatePermitted(collection, selector, mutator, user) -> Boolean`

##### `MunitHelpers.ACL.removePermitted(collection, selector, user) -> Boolean`

Connection (Server Only)
--------------------

##### `MunitHelpers.Connection.create() -> Object`

Creates a connection to this server. Returns an object with three properties:

- `clientConn`, the client end of the connection (as would be returned by `DDP.connect`)
- `serverConn`, the server end of the connection (as would be passed to `Meteor.onConnection`).
- `restore`, which closes down the connection.

WARNING: This method does not work with sinon's fake timers. It does work with `MunitHelpers.StubDate.stub`.

##### `MunitHelpers.Connection.stubLogin(conns:Object, userOrId:Object|String) -> Function`

Stubs a log-in of the given user and marks that user as logged in to the given connection (pass the object returned by `MunitHelpers.Connection.create`). Returns a function that restores the stubbing. The stubs can also be restored by calling `MunitHelpers.restoreAll()`.

##### `MunitHelpers.Connection.restoreAll()`

Closes down all connections created by `MunitHelpers.Connection.create`. This is also done by `MunitHelpers.restoreAll()`.

Publications (Server Only)
--------------------

##### `MunitHelpers.Publications.run(pubName:String, user:Optional Object, args:Optional Array) -> Array`

Runs the given publish function with the given args, with the given user logged in. Returns an object with three properties:

- `collection(name:String) -> Mongo.Collection`: Returns a Minimongo collection that's populated with the results of the publish function. This is similar to calling `new Mongo.Collection(name)` and then `Meteor.subscribe(pubName)`, but the collection is connected only to the specific subscription you're testing.
- `stop()` stops the subscriptions, equivalent to calling `stop` on the object returned by `Meteor.subscribe`.
- `ready()` returns whether the current subscription is ready (has returned a cursor or called `this.ready`).

WARNING: This internally uses `MunitHelpers.Connection.create`, which means it won't work with sinon's fake timers. It does work with `MunitHelpers.StubDate.stub`.

Dirty Tricks
====================

While we avoid it wherever possible, Munit Helpers does have to use a few undocumented Meteor features. We document them here because they are the most brittle parts of the package. In addition, the unit tests for this package have been designed to break if any of these undocumented features change or are removed.

* In `MunitHelpers.ACL`, we use the internal collection methods `_validatedInsert`, `_validatedRemove`, and `_validatedUpdate` so that allow/deny rules will be run even though we're on the server.

* In `MunitHelpers.Connection.create`, we use `makeTestConnection` from the test-helpers package, which is an undocumented core Meteor package.

* In `MunitHelpers.Connection.stubLogin`, we directly modify `Meteor.server.sessions`, which is an internal data structure Meteor uses to keep track of authentications.

Get Involved
====================

If you've found a bug or have a feature request, [file an issue on Github](https://github.com/tulip/munit-helpers).

You also join the [mailing list](https://groups.google.com/forum/#!forum/munit-helpers) if you're interested in getting involved with development.

Contributing
====================

How to submit changes:

1. Fork this repository.
2. Make your changes, including adding or changing appropriate tests.
3. Verify all tests pass with `meteor test-packages ./` and that there are not jshint erros with `jshint .`
4. Email us as opensource@tulip.co to sign a CLA.
5. Submit a pull request.

Pull requests that change or add features and don't have associated unit tests won't be accepted. If you're planning on implementing a large feature, you should email the mailing list first so we can make sure we're on the same page.

Pull requests must also follow the conventions below and pass jshint using the `.jshintrc` in this repo.

Coding Conventions
--------------------

* [Stroustrup Indentation Style](https://en.wikipedia.org/wiki/Indent_style#Variant:_Stroustrup)
* Four spaces, no tabs
* Trailing newline in all files
* Everything in our [jshintrc](.jshintrc)

License
====================

Munit Helpers is licensed under the [Apache Public License](LICENSE).
