var ClBackbone = $CL.namespace('Cl.Backbone');

$CL.require('Cl.Backbone.View');

ClBackbone.FormView = function() {};

ClBackbone.FormView = $CL.extendClass(ClBackbone.FormView, ClBackbone.View, {
    form : null,
    submitCallback : function() {},
    events : {
        'click input[type=submit]' : 'onSubmit',
        'submit form' : 'onSubmit',
    },
    setForm : function(form) {
        this.form = form;
    },
    getForm : function() {
        return this.form;
    },
    setSubmitCallback : function(submitCallback) {
        this.submitCallback = submitCallback;
    },
    render : function() {
        this.data['form'] = this.getForm();
        
        Cl.Backbone.View.prototype.render.call(this);

        this.form.refresh();
    },
    onSubmit : function(e) {
        e.preventDefault();
        if (this.form.isValid()) {
            this.submitCallback(this.form.getData());
        } else {
            this.render();
        }
    }
});