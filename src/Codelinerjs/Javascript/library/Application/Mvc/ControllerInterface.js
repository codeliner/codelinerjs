var Mvc = $CL.namespace("Cl.Application.Mvc");

Mvc.ControllerInterface = function ControllerInterface() {};

Mvc.ControllerInterface.prototype = {
    dispatch : function(mvcEvent) {
        $CL.implementThis();
    }
};