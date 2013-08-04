var ClBackbone = $CL.namespace("Cl.Backbone");

$CL.require("Cl.Backbone.Backbone");
$CL.require("Cl.Event.Manager");
$CL.require("Cl.Event.Event");
$CL.require("Cl.Event.EventManagerProvider");

ClBackbone.Collection = function ClBackboneCollection() {};

ClBackbone.Collection = $CL.extendClass(ClBackbone.Collection, Backbone.Collection, {
    setup : function() {
        this.on("all", $CL.bind(this.triggerClEvent, this));
        this.on("add", $CL.bind(function(model) {
            $CL.initObj(model, this.modelClass);
        }, this));
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

_.extend(ClBackbone.Collection.prototype, Cl.Event.EventManagerProvider);
