var Service = $CL.namespace("Cl.Service");

Service.FallbackFactoryInterface = function FallbackFactoryInterface() {};

(function(i) {
    i.prototype = {
        canCreateService : function(serviceName, serviceManger, params) {
            $CL.implementThis();
        },
        createService : function(serviceName, serviceManager, params) {
            $CL.implementThis();
        }
    }
})(Service.FallbackFactoryInterface);