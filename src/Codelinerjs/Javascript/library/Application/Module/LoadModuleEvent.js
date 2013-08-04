var Module = $CL.namespace("Cl.Application.Module");

$CL.require("Cl.Event.Event");

Module.LoadModuleEvent = function LoadModuleEvent() {};

$CL.extendClass(Module.LoadModuleEvent, Cl.Event.Event, {
    setup : function(options) {
        var params = {
                moduleManager : options.moduleManager,
                application : options.application,
                moduleName : options.moduleName,
                module : options.module
        };

        if ($CL.isDefined(options.params)) {
            params = _.extend(options.params, params);
        }

        this.parent.setup(_.extend(options, {target : "application", name : "loadModule", params : params}));
    },
    getModuleManager : function () {
        return this.parent.params.moduleManager;
    },
    getApplication : function () {
        return this.params.application;
    },
    getModuleName : function() {
        return this.parent.params.moduleName;
    },
    getModule : function() {
        return this.parent.params.module;
    }
});