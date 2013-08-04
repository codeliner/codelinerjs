var Mvc = $CL.namespace("Cl.Application.Mvc");

$CL.require("Cl.Event.Event");

Mvc.MvcEvent = function MvcEvent() {};

$CL.extendClass(Mvc.MvcEvent, Cl.Event.Event, {
    setup : function(options) {
        var params = {
                application : options.application,
                routeMatch : options.routeMatch
        };

        if ($CL.isDefined(options.params)) {
            params = _.extend(options.params, params);
        }

        this.parent.setup.call(this, _.extend(options, {target : "application", name : "dispatch", params : params}));
    },
    getApplication : function() {
        return this.params.appliation;
    },
    getRouteMatch : function() {
        return this.params.routeMatch;
    },
    setResponse : function(response) {
        this.setParam("response", response);
        return this;
    },
    getResponse : function() {
        return this.getParam("response", {content : ""});
    },
    continuePropagation : function() {
	this.propagationStopped = false;
    }
});