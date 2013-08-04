var Element = $CL.namespace('Cl.Form.Element');

$CL.require("Cl.Form.Element.AbstractElement");
$CL.require("Cl.Form.Filter.StringTrim");
$CL.require("Cl.Form.Validator.NotEmpty");

Element.Hidden = function() {};

Element.Hidden = $CL.extendClass(Element.Hidden, Element.AbstractElement, {
    init : function() {
        this.addFilter($CL.get('Cl.Form.Filter.StringTrim'));

        this.addValidator($CL.get('Cl.Form.Validator.NotEmpty'));
    },
    selectElement : function() {
        this.$el = $('input[name='+this.getName()+']');
    }
});

