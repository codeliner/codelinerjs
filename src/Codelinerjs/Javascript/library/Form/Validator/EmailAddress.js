var Validator = $CL.namespace('Cl.Form.Validator');

Validator.EmailAddress = function() {};

Validator.EmailAddress.prototype = {
    error : null,
    isValid : function(val) {
        //a very simple format check, real email check should be done serverside
        var regEx = new RegExp("^[^@]+@[^\\.]+\\.[^\\.]{2,}$");
        if (regEx.test(val)) {
            return true;
        } else {
            this.error = {name : "EmailAddressError", msg : $CL.translate("Value has no valid email format!")};
            return false;
        }
    },
    getError : function() {
        return this.error;
    }
}