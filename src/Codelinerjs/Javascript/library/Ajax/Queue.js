var Ajax = $CL.namespace('Cl.Ajax');

$CL.require("Cl.Event.EventManagerProvider");

Ajax.Queue = function() {
    this.count = 0;
    this.done  = 0;
    this.failed = function() {};
};

Ajax.Queue.prototype = {
    setFailedCallback : function(callback) {
        this.failed = callback;
    },
    setFinishCallback : function(callback) {
        this.events().attach("finish", callback, 0, true);
    },
    addJqXhr : function(jqXhr) {
        if (this.count == 0) {
            this.events().trigger("start");
        }

        this.count++;
        jqXhr.always($CL.bind(function(){
            this.done++;
            if (this.done == this.count) {
                this.events().trigger("finish");
            }
        }, this)).fail(this.failed);
    },
    isRunning : function()
    {
        return this.done != this.count;
    },
    reset : function() {
        this.count = 0;
        this.done = 0;
        this.failed = function() {};
    },
    close : function() {
        if (!this.isRunning()) {
            this.events().trigger("finish");
        }
    }
};

_.extend(Ajax.Queue.prototype, Cl.Event.EventManagerProvider);