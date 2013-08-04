var Event = $CL.namespace("Cl.Event");

Event.Manager = function() {
    this.emInstanceId;
};

(function (m) {
    m.prototype = {
        setup : function(options) {
            this.emInstanceId = this.getSharedManager().getNewInstanceId();
            this.target = options.target;
        },
        getSharedManager : function() {
            var sharedEM = $CL.get("shared_event_manager");

            if (null === sharedEM) {
                $CL.exception("Can not get shared EventManager from ServiceManager", "Cl.Event.Manager");
            }

            return sharedEM;
        },
        attach : function (event, listener, priority, triggerOnce) {
            this.getSharedManager().attach(this.target + '___' + this.emInstanceId, event, listener, priority, triggerOnce);
        },
        detach : function (event, listener) {
            this.getSharedManager().detach(this.target + '___' + this.emInstanceId, event, listener);
        },
        trigger : function (event) {
            if ($CL.isInstanceOf(event, Cl.Event.Event)) {
                if (!$CL.isDefined(event.target) || _.isNull(event.target)) {
                    event.target = this.target;
                }

                if (event.target == this.target) {
                    event.target += '___' + this.emInstanceId;
                    return this.getSharedManager().trigger(event);
                }
            } else if (_.isString(event)) {
                return this.getSharedManager().trigger(this.target + '___' + this.emInstanceId, event);
            }

            $CL.exception("Unknown event provided", "Cl.Event.Manager", event);
        }
    }
})(Event.Manager);

$CL.non_shared_services.push("event_manager");
$CL.invokables["event_manager"] = "Cl.Event.Manager";