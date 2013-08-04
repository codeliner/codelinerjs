var View = $CL.namespace("Cl.Application.View");

$CL.require("Cl.Application.View.RenderingStrategyInterface")

View.DefaultStrategy = function DefaultStrategy() {
    this.__IMPLEMENTS__ = [Cl.Application.View.RenderingStrategyInterface];
};

View.DefaultStrategy.prototype = {
    /*
    * Default rendering strategy, uses _.template() to render Response
    *
    * @param mvcEvent | Cl_Application_Mvc_MvcEvent
    *
    * @return void
    */
    onRender : function(mvcEvent) {
        var response = mvcEvent.getResponse(),
        routeMatch = mvcEvent.getRouteMatch(),
        //if tpl_id is provided as a param, it is used as #tpl_id to select DOMElement containing the template
        //if not present, strategy is searching for a template named: module_controller_action_template
        tplId = mvcEvent.getParam(
            'tpl_id',
            "#" + routeMatch.getModule() + "_" + routeMatch.getController() + "_" + routeMatch.getAction() + "_template"
        );

        if ($CL.$(tplId).length != 1) {
            $CL.exception("No template found with id: " + tplId, "Cl.Application.Application");
        }

        var tpl = _.template($CL.$(tplId).html());

        if (!_.isObject(response)) {
            response = {content : response};
        }

        var $targetEl = mvcEvent.getParam('$_target_el', $(tplId.replace('_template', '')));

        if ($targetEl.length > 0) {
            $targetEl.html(tpl(response));
        }
    }
};