var View = $CL.namespace("Cl.Application.View");

View.RenderingStrategyInterface = function RenderingStrategyInterface() {};

View.RenderingStrategyInterface.prototype = {
    onRender : function(mvcEvent) {
        $CL.implementThis();
    }
};