var Element = $CL.namespace('Cl.Form.Element');

$CL.require("Cl.Form.Element.Text");
$CL.require("Cl.Form.Validator.Digits");
$CL.require("Cl.Form.Validator.StringLength");

Element.Zipcode = function() {};

Element.Zipcode = $CL.extendClass(Element.Zipcode, Element.Text, {
    init : function() {
        this.parent.init.apply(this);

        this.addValidator($CL.get("Cl.Form.Validator.Digits"));
        this.addValidator($CL.makeObj("Cl.Form.Validator.StringLength", {min : 5, max : 5}));
    }
});


