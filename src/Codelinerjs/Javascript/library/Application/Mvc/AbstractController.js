var Mvc = $CL.namespace("Cl.Application.Mvc");

$CL.require("Cl.Application.Mvc.ControllerInterface");
$CL.require("Cl.Application.Mvc.ControllerEvent");
$CL.require("Cl.Event.EventManagerProvider");

Mvc.AbstractController = function AbstractController() {
    this.__IMPLEMENTS__ = [Mvc.ControllerInterface];
};

Mvc.AbstractController.prototype = {
    mvcEvent : null,
    controllerEvent : null,
    getMvcEvent : function() {
        return this.mvcEvent;
    },
    getControllerEvent : function() {
        if (_.isNull(this.controllerEvent)) {

            this.controllerEvent = $CL.makeObj('Cl.Application.Mvc.ControllerEvent', {
                target : $CL.className(this),
                name : 'dispatch.pre',
                mvcEvent : this.getMvcEvent()
            });
        }

        return this.controllerEvent;
    },
    dispatch : function(mvcEvent) {
        var response;

        this.mvcEvent = mvcEvent;

        this.events().trigger(this.getControllerEvent());

        if (this.getControllerEvent().isPropagationStopped()) {
            response = this.getControllerEvent().getResponse();
            this.controllerEvent = null;
            return response;
        }

        var action = mvcEvent.getRouteMatch().getAction() + "Action";

        if ($CL.has(this, action) && typeof this[action] == "function") {
            response = this[action]();
            this.getControllerEvent().setResponse(response);
            this.getControllerEvent().name = 'dispatch.post';
            this.events().trigger(this.getControllerEvent());
            response = this.getControllerEvent().getResponse();
            this.controllerEvent = null;
            return response;
        } else {
            $CL.exception("action not found", $CL.className(this), action);
        }
    }
}

_.extend(Mvc.AbstractController.prototype, Cl.Event.EventManagerProvider);


