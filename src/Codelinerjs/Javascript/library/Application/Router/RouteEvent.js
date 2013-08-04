var Router = $CL.namespace("Cl.Application.Router");

$CL.require("Cl.Event.Event");

Router.RouteEvent = function RouteEvent() {};

$CL.extendClass(Router.RouteEvent, Cl.Event.Event, {
    setup : function(options) {
        var params = {
                routeMatch : options.routeMatch,
                application : options.application
        };

        if ($CL.isDefined(options.params)) {
            params = _.extend(options.params, params);
        }

        this.parent.setup(_.extend(options, {target : "application", name : "route", params : params}));
    },
    getRouteMatch : function () {
        return this.parent.params.routeMatch;
    },
    getApplication : function () {
        return this.params.application;
    }
});