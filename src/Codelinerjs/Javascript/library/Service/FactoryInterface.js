var Service = $CL.namespace("Cl.Service");

Service.FactoryInterface = function FactoryInterface() {};

(function(i) {
    i.prototype = {
        createService : function(serviceManager, params) {
            $CL.implementThis();
        }
    }
})(Service.FactoryInterface);