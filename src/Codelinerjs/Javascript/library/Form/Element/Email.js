var Element = $CL.namespace('Cl.Form.Element');

$CL.require("Cl.Form.Element.Text");
$CL.require("Cl.Form.Validator.EmailAddress");

Element.Email = function() {};

Element.Email = $CL.extendClass(Element.Email, Element.Text, {
    init : function() {
        this.parent.init.apply(this);

        this.addValidator($CL.get('Cl.Form.Validator.EmailAddress'));
    }
});


