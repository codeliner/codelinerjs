var Element = $CL.namespace('Cl.Form.Element');

$CL.require("Cl.Form.Element.AbstractElement");
$CL.require("Cl.Form.Filter.StringTrim");
$CL.require("Cl.Form.Validator.NotEmpty");

Element.Textarea = function() {};

Element.Textarea = $CL.extendClass(Element.Textarea, Element.AbstractElement, {
    init : function() {
        this.addFilter($CL.get('Cl.Form.Filter.StringTrim'));

        this.addValidator($CL.get('Cl.Form.Validator.NotEmpty'));
    },
    selectElement : function() {
        this.$el = $('textarea[name='+this.getName()+']');
        this.$el.unbind('blur.form-element');
        this.$el.bind('blur.form-element', $CL.bind(function(e) {
            this.isValid();
        }, this));
    }
});