var ClBackbone = $CL.namespace("Cl.Backbone");

$CL.require("Cl.Backbone.Backbone");
$CL.require("Cl.Application.View.RendererInterface");
$CL.require("Cl.Event.Manager");
$CL.require("Cl.Event.Event");

ClBackbone.View = function() {};

ClBackbone.View = $CL.extendClass(ClBackbone.View, Backbone.View, {
    tpl : "",
    data : {},
    __IMPLEMENTS__ : [Cl.Application.View.RendererInterface],
    setup : function() {
        this.on("all", $CL.bind(this.triggerClEvent, this));
    },
    triggerClEvent : function() {
        var eventName = arguments[0];

        var newArgs = [];

        for (var i in arguments) {
            if(i != 0)
                newArgs[newArgs.length] = arguments[i];
        }

        var event = $CL.get("Cl.Event.Event", {
            params : {
                arguments : newArgs
            },
            name : eventName
        });

        this.clEvents().trigger(event);
    },
    clEvents : function() {
        if (!$CL.has(this, "__eventManager")) {
            this["__eventManager"] = $CL.get("event_manager", {
                target : $CL.className(this)
            });
        }

        return this["__eventManager"];
    },
    setModel : function(model) {
        this.model = model;
        return this;
    },
    setData : function(data) {
        this.data = data;
        return this;
    },
    setTemplate : function(template) {
        this.tpl = template;
        return this;
    },
    render : function() {
        this.$el.html(this.tpl(this.data));
    },
    stopPropagation : function(e) {
        e.stopPropagation();
    }
});
