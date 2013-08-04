var Router = $CL.namespace("Cl.Application.Router");

Router.RouteMatch = function RouteMatch() {};

Router.RouteMatch.prototype = {
    params : {},
    setup : function(options) {
        _.extend(this, options);
    },
    getRoute : function() {
        if ($CL.has(this, "route"))
            return this.route;
        else
            return "";
    },
    getModule : function() {
	if ($CL.has(this, "module"))
            return this.module;
        else
            return "";
    },
    getController : function() {
        if ($CL.has(this, "controller"))
            return this.controller;
        else
            return "";
    },
    getAction : function() {
        if ($CL.has(this, "action"))
            return this.action;
        else
            return "";
    },
    getParams : function() {
        if ($CL.has(this, "params")) {
            return this.params;
        } else {
            return {};
        }
    },
    getParam : function(key, defaultVal) {


        if ($CL.has(this.params, key)) {
            return this.params[key];
        }

        return defaultVal;
    }
};