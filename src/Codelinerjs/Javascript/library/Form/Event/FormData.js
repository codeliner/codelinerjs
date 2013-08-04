var Event = $CL.namespace("Cl.Form.Event");

$CL.require("Cl.Event.Event");

Event.FormData = function() {};

$CL.extendClass(Event.FormData, Cl.Event.Event, {
    setup : function(options) {
        this.parent.setup.call(this, _.extend(options, {name : "getData"}));
    },
    setFormData : function(formData) {
        this.setParam('formData', formData);
    },
    getFormData : function() {
        return this.getParam('formData', {});
    }
});