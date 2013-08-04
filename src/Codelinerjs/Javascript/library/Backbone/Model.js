var ClBackbone = $CL.namespace("Cl.Backbone");

$CL.require("Cl.Backbone.Backbone");
$CL.require("Cl.Event.Manager");
$CL.require("Cl.Event.Event");
$CL.require("Cl.Event.EventManagerProvider");

ClBackbone.Model = function ClBackboneModel() {};

ClBackbone.Model = $CL.extendClass(ClBackbone.Model, Backbone.Model, {
    setup : function() {
        this.on("all", $CL.bind(this.triggerClEvent, this));
    },
    getParams : function() {
        return _.clone(this.attributes);
    },
    triggerClEvent : function() {
        var eventName = arguments[0];

        var newArgs = [];

        for (var i in arguments) {
            if(i != 0)
                newArgs[newArgs.length] = arguments[i];
        }

        var event = $CL.get("Cl.Event.Event", {
            params : {arguments : newArgs},
            name : eventName
        });

        this.events().trigger(event);
    }
});

_.extend(ClBackbone.Model.prototype, Cl.Event.EventManagerProvider);
