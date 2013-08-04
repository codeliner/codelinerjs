var Event = $CL.namespace("Cl.Event");

$CL.require('Cl.Event.Manager');

Event.EventManagerProvider = {
    events : function() {
        if (!$CL.has(this, "__eventManager")) {
            this["__eventManager"] = $CL.get("event_manager", {
                target : $CL.className(this)
            });
        }

        return this["__eventManager"];
    }
};