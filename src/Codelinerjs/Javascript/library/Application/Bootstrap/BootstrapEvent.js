var Bootstrap = $CL.namespace("Cl.Application.Bootstrap");

$CL.require("Cl.Event.Event");

Bootstrap.BootstrapEvent = function BootstrapEvent() {};

$CL.extendClass(Bootstrap.BootstrapEvent, Cl.Event.Event, {
    setup : function(options) {
        var params = {
                application : options.application
        };

        if ($CL.isDefined(options.params)) {
            params = _.extend(options.params, params);
        }

        this.parent.setup(_.extend(options, {target : "application", name : "bootstrap", params : params}));
    },
    getModuleManager : function () {
        return this.params.application.moduleManager;
    },
    getApplication : function () {
        return this.params.application;
    }
});