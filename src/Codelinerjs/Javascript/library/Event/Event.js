var Event = $CL.namespace("Cl.Event");

Event.Event = function Event() {};

(function (e) {
    e.prototype = {
        setup : function(options) {
            this.propagationStopped = false;
            this.name = options.name;
            this.target = options.target;
            this.params = {};

            if ($CL.has(options, "params"))
                this.params = _.extend(this.params, options.params);
        },
        getParam : function (name, defaultValue) {
            return $CL.has(this.params, name)?
            this.params[name] : $CL.isDefined(defaultValue)?
            defaultValue : null;
        },
        setParam : function (name, value) {
            this.params[name] = value;
            return this;
        },
        stopPropagation : function () {
            this.propagationStopped = true;
        },
        isPropagationStopped : function () {
            return this.propagationStopped;
        }
    }
})(Event.Event);

$CL.non_shared_services.push("Cl.Event.Event");