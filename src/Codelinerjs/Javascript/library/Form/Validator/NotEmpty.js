var Validator = $CL.namespace('Cl.Form.Validator');

Validator.NotEmpty = function() {};

Validator.NotEmpty.prototype = {
    error : null,
    isValid : function(val) {
        if ($CL.isEmpty(val) === false) {
            return true;
        } else {
            this.error = {name : "NotEmptyError", msg : $CL.translate("Value is empty!")};
            return false;
        }
    },
    getError : function() {
        return this.error;
    }
}