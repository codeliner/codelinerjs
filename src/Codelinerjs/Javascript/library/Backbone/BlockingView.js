var ClBackbone = $CL.namespace("Cl.Backbone");

$CL.require("Cl.Backbone.View");

ClBackbone.BlockingView = function() {};

ClBackbone.BlockingView = $CL.extendClass(ClBackbone.BlockingView, Cl.Backbone.View, {
    renderingIsBlocked : false,
    renderingQueued : false,
    blockRendering : function() {
        this.renderingIsBlocked = true;
    },
    stopBlocking : function() {
        this.renderingIsBlocked = false;

        if (this.renderingQueued) {
            this.render();
            this.renderingQueued = false;
        }
    },
    render : function() {
        if (!this.renderingIsBlocked) {
            Cl.Backbone.View.prototype.render.apply(this);
        } else {
            this.renderingQueued = true;
        }
    }
});