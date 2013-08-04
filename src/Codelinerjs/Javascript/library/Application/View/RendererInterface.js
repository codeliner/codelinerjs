var View = $CL.namespace("Cl.Application.View");

View.RendererInterface = function RendererInterface() {};

View.RendererInterface.prototype = {
    render : function() {
        $CL.implementThis();
    }
};