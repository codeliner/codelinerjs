var Event = $CL.namespace("Cl.Event");

$CL.require("Cl.Event.Event");

Event.SharedManager = function SharedEventManager() {
    this.emInstances = 0;
};

(function (em) {
    em.prototype = {
        setup : function(options) {
            this.targets = {};
        },
        /**
        * Creates default structure for a target
        *
        * @param target |string Name of the target, which fires the event
        *
        * @return this
        */
        registerTarget : function (target) {
            this.targets[target] = {
                events : {}
            };

            return this;
        },
        /**
        * Checks if target is registered
        *
        * @param target |string Name of the target
        *
        * @return boolean
        */
        hasTarget : function (target) {
            return typeof this.targets[target] != "undefined";
        },

        /**
        * Checks if event is registered under target name
        *
        * @param target |string Name of the target
        * @param event |string Name of the Event
        *
        * @return boolean
        */
        hasEvent : function (target, event) {
            if (!this.hasTarget(target))
                return false;
            if (!$CL.has(this.targets[target].events, event)) {
                return false;
            }

            return true;
        },

        registerEvent : function (target, event) {
            if (!this.hasTarget(target)) {
                $CL.exception(
                    'target: ' + target + ' not registered',
                    "Cl.Event.SharedManager",
                    {
                        target: target,
                        event: event
                    }
                    );
            }

            if (!this.hasEvent(target, event)) {
                this.targets[target].events[event] = [];
            }

            return this;
        },

        /**
        * Attachs a listener to a target
        *
        * @param target      |string   Name of the target
        * @param event       |string   Name of the Event
        * @param listener    |callback Listener, which should be fired
        * @param priority    |int      Priority System, higher number means higher priority
        * @param triggerOnce |bool     Defaults to false but if true, listener is only triggered once
        *
        * @return this
        */
        attach : function(target, event, listener, priority, triggerOnce) {
            if (!this.hasTarget(target)) {
                this.registerTarget(target);
            }

            if (!this.hasEvent(target, event)) {
                this.registerEvent(target, event);
            }

            if (!$CL.isDefined(priority)) {
                priority = 0;
            }

            if(!$CL.isDefined(triggerOnce)) {
                triggerOnce = false;
            }

            this.targets[target].events[event].push({
                listener : listener,
                priority : parseInt(priority),
                triggerOnce : triggerOnce
            });

            return this;
        },
        /**
        * Detaches a listener from given target event
        *
        * @param target |string Name of the target
        * @param event |string Name of the event
        * @param listener |callback Function, that listen on event
        */
        detach : function (target, event, listener) {
            if (this.hasEvent(target, event)) {
                var events = this.targets[target].events[event];

                var foundLIstener = false;

                if (_.isString(listener) && listener == "all") {
                    delete this.targets[target].events[event];
                    return;
                }

                for (var i=0; i<events.length; i++) {
                    if (events[i].listener == listener) {
                        foundLIstener = events[i];
                        break;
                    }
                }

                if (event) {
                    this.targets[target].events[event] = _.without(
                        this.targets[target].events[event],
                        foundLIstener
                        );
                }
            }

            return this;
        },
        trigger : function (eventOrTarget, eventName) {
            var target, targetId, eName, event, responseCollection = [];

            if ($CL.isInstanceOf(eventOrTarget, Cl.Event.Event)) {
                target = eventOrTarget.target;
                eName = eventOrTarget.name;
                event = eventOrTarget;
            } else {
                target = eventOrTarget;
                eName = eventName;
                event = $CL.makeObj("Cl.Event.Event", {
                    target : target,
                    name : eName
                });
            }

            if (target.indexOf('___') != -1) {
                var targetArr = target.split('___');
                target = targetArr[0];
                targetId = targetArr[1];
                event.target = target;
            } else {
                targetId = "";
            }

            if (this.hasEvent(target, eName) || this.hasEvent(target + '___' + targetId, eName)) {
                var listeners = [];

                if (this.hasEvent(target + '___' + targetId, eName)) {
                    listeners = listeners.concat(this.targets[target + '___' + targetId].events[eName]);
                }

                if (this.hasEvent(target, eName)) {
                    listeners = listeners.concat(this.targets[target].events[eName]);
                }


                listeners.sort(function (a, b) {
                    return a.priority - b.priority;
                }).reverse();

                for(var i=0;i<listeners.length;i++) {
                    var listener = listeners[i].listener;

                    if (typeof listener == "object") {
                        var context = listener[1];
                        listener = listener[0];

                        listener = $CL.bind(listener, context);
                    }

                    if (typeof listener != "function") {
                        $CL.exception(
                            "Listener is not a function",
                            "Cl.Event.SharedManager",
                            {
                                listeners : listeners,
                                listener : listener
                            }
                            );
                    }

                    if (listeners[i].triggerOnce) {
                        //detach befor trigger to avoid endless loops
                        this.detach(target, eName, listeners[i].listener);
                    }

                    responseCollection.push(listener(event));

                    if (event.isPropagationStopped()) {
                        break;
                    }
                }

                //detach all triggerOnce listeners, even if they were not triggered in this round
                //triggerOnce listener should only be used to run in current event, if another listener
                //stops propagation, the triggerOnce listener never will be called
                var tol = [];
                if (this.hasEvent(target + '___' + targetId, eName)) {
                    tol = _.filter(this.targets[target + '___' + targetId].events[eName], function(l) {
                        return l.triggerOnce;
                    });

                    if(tol.length > 0) {
                        _.each(tol, function(l) {
                            this.detach(target + '___' + targetId, eName, l.listener);
                        }, this);
                    }
                }

                if (this.hasEvent(target, eName)) {
                    tol = _.filter(this.targets[target].events[eName], function(l) {
                        return l.triggerOnce;
                    });

                    if(tol.length > 0) {
                        _.each(tol, function(l) {
                            this.detach(target, eName, l.listener);
                        }, this);
                    }
                }
            }

            return responseCollection;
        },
        getNewInstanceId : function() {
            this.emInstances++;
            return this.emInstances;
        }
    }
})(Event.SharedManager);

$CL.invokables["shared_event_manager"] = "Cl.Event.SharedManager";