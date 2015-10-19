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

    // view ID -> View
    // When we return a jQuery function, we add a magic "_munitHelpersViewId"
    // that's used here so be can recover the view later
    var views = {};

    MunitHelpers.Templates = {
        render: function(template, data) {
            // stub Meteor._debug so we can assert that no errors were thrown.
            spies.create("munitHelpersMeteorDebug", Meteor, "_debug");

            // render to a detached div
            var div = $("<div />");
            var view = Blaze.renderWithData(template, data, div[0]);
            Tracker.flush();

            // assert no errors were thrown
            if(spies.munitHelpersMeteorDebug.callCount > 0) {
                Blaze.remove(view);
                throw new Error(template.viewName + " threw an error: " + spies.munitHelpersMeteorDebug.args[0].join(" "));
            }

            // store the view
            var viewId = MunitHelpersInternals.randomId();
            views[viewId] = view;

            // return a function that acts like $ but only searches inside the
            // template. Also store the view ID with the function.
            var boundFn = _.bind(div.find, div);
            boundFn._munitHelpersViewId = viewId;
            return boundFn;
        },

        renderLayout: function(layoutTemplate, contentTemplate, data) {
            if(!Package["iron:layout"]) {
                throw "MunitHelpers.Templates.renderLayout requires the iron:layout package";
            }

            var Iron = Package["iron:core"].Iron;

            // stub Meteor._debug so we can assert that no errors were thrown.
            spies.create("munitHelpersMeteorDebug", Meteor, "_debug");

            var div = $("<div />");

            var layout = new Iron.Layout({template: layoutTemplate, data: data});
            layout.render(contentTemplate);
            layout.insert({el: div});
            Tracker.flush();

            var view = Blaze.getView(div.children()[0]);

            // assert no errors were thrown
            if(spies.munitHelpersMeteorDebug.callCount > 0) {
                Blaze.remove(view);
                throw new Error("Layout " + layoutTemplate.name + " threw an error: " + spies.munitHelpersMeteorDebug.args[0].join(" "));
            }

            // store the view
            var viewId = MunitHelpersInternals.randomId();
            views[viewId] = view;

            // return a function that acts like $ but only searches inside the
            // template. Also store the view ID with the function.
            var boundFn = _.bind(div.find, div);
            boundFn._munitHelpersViewId = viewId;
            return boundFn;
        },

        create: function(name, html) {
            return new Template(name, function() {
                return HTML.Raw(html);
            });
        },

        restore: function(jqueryOrViewId) {
            var viewId = jqueryOrViewId;
            if(jqueryOrViewId._munitHelpersViewId) {
                viewId = jqueryOrViewId._munitHelpersViewId;
            }

            Blaze.remove(views[viewId]);
            delete views[viewId];
        },

        restoreAll: function() {
            _.keys(views).forEach(function(viewId) {
                MunitHelpers.Templates.restore(viewId);
            });
        }
    };

    MunitHelpersInternals.onRestoreAll(MunitHelpers.Templates.restoreAll);
})();
