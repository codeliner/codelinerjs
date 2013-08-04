var Mvc = $CL.namespace("Cl.Application.Mvc");

$CL.require("Cl.Event.Event");
/**
 * Description of ControllerEvent
 *
 * @author Alexander Miertsch <kontakt@codeliner.ws>
 * @copyright (c) 2013, Alexander Miertsch
 */
Mvc.ControllerEvent = function ControllerEvent() {};

Mvc.ControllerEvent = $CL.extendClass(Mvc.ControllerEvent, Cl.Event.Event, {
    setup : function(options) {
        var params = {
                mvcEvent : options.mvcEvent
        };

        if ($CL.isDefined(options.params)) {
            params = _.extend(options.params, params);
        }

        options.params = params;

        this.parent.setup.call(this, options);
    },
    getMvcEvent : function() {
        return this.params.mvcEvent;
    },
    setResponse : function(response) {
        this.setParam("response", response);
        return this;
    },
    getResponse : function() {
        return this.getParam("response");
    }
});