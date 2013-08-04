var Validator = $CL.namespace('Cl.Form.Validator');

Validator.GreaterThan = function() {};

Validator.GreaterThan.prototype = {
    min : 0,
    error : null,
    setup : function(options) {
        if ($CL.isDefined(options.min)) {
            this.min = options.min;
        }
    },
    setMin : function(min) {
        this.min = min;
    },
    isValid : function(val) {
        var valid = true;

        valid = val > this.min;

        if (!valid) {
            this.error = {name : "GreaterThanError", msg : $CL.translate("Value is not greater than %d!").replace('%d', this.min)};
        }

        return valid;
    },
    getError : function() {
        return this.error;
    }
}