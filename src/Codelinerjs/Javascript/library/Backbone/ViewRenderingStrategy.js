var ClBackbone = $CL.namespace("Cl.Backbone");

$CL.require("Cl.Backbone.Backbone");
$CL.require("Cl.Application.View.RenderingStrategyInterface");

ClBackbone.ViewRenderingStrategy = function ClBackboneViewRenderingStrategy() {
    this.__IMPLEMENTS__ = [Cl.Application.View.RenderingStrategyInterface];
};

ClBackbone.ViewRenderingStrategy.prototype = {
    onRender : function(mvcEvent) {
        if ($CL.isInstanceOf(mvcEvent.getResponse(), Cl.Backbone.View)) {
            mvcEvent.stopPropagation();
            mvcEvent.getResponse().render();
        }

        return;
    }
};