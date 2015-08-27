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

Package.describe({
    summary: "Helpers for writing unit tests with ",
    version: "0.1.0",
    name: "tulip:munit-helpers",
    git: "TODO"
});

Package.onUse(function (api) {
    "use strict";

    api.versionsFrom("1.0.3.1");

    api.use([
        "blaze",
        "check",
        "htmljs",
        "jquery",
        "minimongo",
        "mongo",
        "random",
        "templating",
        "test-helpers",
        "underscore",
        "less",

        "practicalmeteor:munit"
    ]);

    api.use([
        "iron:layout"
    ], {weak: true});

    api.imply("practicalmeteor:munit");


    // common files
    api.addFiles([
        "munit_helpers.js",

        "lib/chai-stats.js",
        "lib/lolex.js",

        "common/auth.js",
        "common/collections.js",
        "common/stub_properties.js",
        "common/stub_date.js"
    ]);

    // client-only files
    api.addFiles([
        "client/auth.js",
        "client/templates.js",
        "lib/chai-jquery.js"
    ], "client");

    // server-only files
    api.addFiles([
        "server/acl.js",
        "server/connection.js",
        "server/methods.js",
        "server/publications.js"
    ], "server");

    // exports
    api.export("MunitHelpers");
});

Package.onTest(function(api) {
    "use strict";

    api.use([
        "accounts-base",
        "mongo",
        "random",
        "reactive-var",
        "templating",
        "underscore",

        "tulip:munit-helpers",
        "iron:router"
    ]);

    api.addFiles([
        "tests/common/auth_tests.js",
        "tests/common/collections_tests.js",
        "tests/common/stub_date_tests.js",
        "tests/common/stub_properties_tests.js"
    ]);

    api.addFiles([
        "tests/client/auth_tests.js",
        "tests/client/templates_tests.html",
        "tests/client/templates_tests.js"
    ], "client");

    api.addFiles([
        "tests/server/acl_tests.js",
        "tests/server/connection_tests.js",
        "tests/server/methods_tests.js",
        "tests/server/publications_tests.js"
    ], "server");

});

