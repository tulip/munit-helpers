# 0.3.4

* `MunitHelpers.Auth.stubUser` now correctly handles users that already exist.

# 0.3.4

* Better support for testing methods that create users

# 0.3.3

* More flexible error handling in MunitHelpers.ACL

# 0.3.2

* Only stub users in stubLogin if a user record is passed, not if a string is
  passed.

# 0.3.1

* Fix restoring stubbed individual connections

# 0.3

* MunitHelpers.Collections.stub now does not copy exiting records by default
  when stubbing a real Mongo.Collection (as opposed to an existing stub)

* Added MunitHelpers.DeepMatch

# 0.2.1

* MunitHelpers.Methods.apply now works on both client and server

* Fix behavior of MunitHelpers.Auth.stubLogin to correctly stub `this.userId`
  inside client-side method stubs


# 0.2

* Support for Meteor 1.2.

* MunitHelpers.Collections.stub will now stub _collection only on real
  Mongo.Collections, not Minimongo collections.

* MunitHelpers.Collections.stub will now stub _ensureIndex on real
  Mongo.Collections.

* MunitHelpers.Templates.render will throw an error if the template it's
  rendering throws an error.

# 0.1

* Initial release.
