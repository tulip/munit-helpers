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


    // create some simple behavior for the test template
    Template.munitHelpersTestTemplate.created = function() {
        this.bar = new ReactiveVar(0);
    };

    Template.munitHelpersTestTemplate.helpers({
        bar: function() {
            return Template.instance().bar.get();
        }
    });

    Template.munitHelpersTestTemplate.events({
        "click .b": function(evt, tmpl) {
            tmpl.bar.set(tmpl.bar.get() + 1);
        }
    });


    // helpers that check whether an instance of Template.munitHelpersTestTemplate
    // is doing reactive updates
    var templateIsAlive = function($) {
        var initial = Number($(".b").text());

        $(".b").click();
        Tracker.flush();

        return Number($(".b").text()) === (initial + 1);
    };


    Munit.run({
        name: "Munit Helpers Templates Test",

        tearDown: MunitHelpers.restoreAll,

        testTemplateRender: function() {
            var $ = MunitHelpers.Templates.render(Template.munitHelpersTestTemplate, {
                foo: "hello-foo"
            });

            // check that the render worked
            expect($(".parent > .a")).to.have.text("hello-foo");

            // check the helper
            expect($(".parent > .b")).to.have.text("0");

            // check the event
            $(".b").click();
            Tracker.flush();
            expect($(".parent > .b")).to.have.text("1");
        },

        testTemplateRenderLayout: function() {
            var $ = MunitHelpers.Templates.renderLayout(
                Template.munitHelpersTestLayout,
                Template.munitHelpersTestTemplate,
                { foo: "testing" }
            );

            // check that the layout was rendered
            expect($("div.foo")).to.exist;

            // check that the child template was rendered
            expect($("div.foo > div.parent")).to.exist;

            // check that the data was passed on correctly
            expect($("div.foo > div.parent > div.a")).to.have.text("testing");
        },

        testTemplateCreate: function() {
            var html = "<div class='x'>foo</div>";
            var tmpl = MunitHelpers.Templates.create("Foo Template", html);

            expect(Blaze.toHTML(tmpl)).to.equal(html);
            expect(tmpl.viewName).to.equal("Foo Template");
        },

        testTemplateRestore: function() {
            // Render two templates, restore one, and expect that one to be dead
            // and the other to still be alive.
            var $1 = MunitHelpers.Templates.render(Template.munitHelpersTestTemplate);
            var $2 = MunitHelpers.Templates.render(Template.munitHelpersTestTemplate);
            expect(templateIsAlive($1)).to.be.true;
            expect(templateIsAlive($2)).to.be.true;

            MunitHelpers.Templates.restore($1);
            expect(templateIsAlive($1)).to.be.false;
            expect(templateIsAlive($2)).to.be.true;
        },

        testTemplateRestoreAll: function() {
            // Render two templates, restoreAll, and expect them both to be dead
            var $1 = MunitHelpers.Templates.render(Template.munitHelpersTestTemplate);
            var $2 = MunitHelpers.Templates.render(Template.munitHelpersTestTemplate);
            expect(templateIsAlive($1)).to.be.true;
            expect(templateIsAlive($2)).to.be.true;

            MunitHelpers.Templates.restoreAll();
            expect(templateIsAlive($1)).to.be.false;
            expect(templateIsAlive($2)).to.be.false;
        }
    });
})();
