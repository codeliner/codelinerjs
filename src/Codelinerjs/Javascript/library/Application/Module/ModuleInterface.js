var Module = $CL.namespace("Cl.Application.Module");

Module.ModuleInterface = function ModuleInterface() {};

Module.ModuleInterface.prototype = {
    //-------------------------------------
    //function getConfig() is optional
    //it can be used to provide module config, that is merged with
    //application config
    //getConfig : function(){}
    //-------------------------------------
    //function onBootstrap() is optional
    //it can be used, to auto register a listener on application bootstrap event
    //onBootstrap : function() {}
    //-------------------------------------
    /*
     * Provides a Cl.Application.Mvc.Controller, that handles the request
     * detected by application.router
     *
     * @param controllerName | String | Name of the detected controller
     *
     * @return Cl.Application.Mvc.Controller
     */
    //getController : function(controllerName) {}
};