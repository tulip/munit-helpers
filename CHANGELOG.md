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
