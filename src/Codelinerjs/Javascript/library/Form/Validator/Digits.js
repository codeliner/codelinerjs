var Validator = $CL.namespace('Cl.Form.Validator');

Validator.Digits = function() {};

Validator.Digits.prototype = {
    error : null,
    isValid : function(val) {
        var regEx = new RegExp("^[0-9]+$");
        if (regEx.test(val)) {
            return true;
        } else {
            this.error = {name : "DigitsError", msg : $CL.translate("Value contains other chars than digits!")};
            return false;
        }
    },
    getError : function() {
        return this.error;
    }
}