var Validator = $CL.namespace('Cl.Form.Validator');

Validator.StringLength = function() {};

Validator.StringLength.prototype = {
    min : 0,
    max : 0,
    error : null,
    setup : function(options) {
        if ($CL.isDefined(options.min)) {
            this.min = options.min;
        }

        if ($CL.isDefined(options.max)) {
            this.max = options.max;
        }
    },
    setMin : function(min) {
        this.min = min;
    },
    setMax : function(max) {
        this.max = max;
    },
    isValid : function(val) {
        var valid = true;

        if (this.min > 0) {
            valid = val.length >= this.min;

            if (!valid) {
                this.error = {name : "StringToShortError", msg : $CL.translate("Value is shorter than %d!").replace('%d', this.min)};
            }
        }

        if (valid && this.max > 0) {
            valid = val.length <= this.max;

            if (!valid) {
                this.error = {name : "StringToLongError", msg : $CL.translate("Value is longer than %d!").replace('%d', this.max)};
            }
        }

        return valid;
    },
    getError : function() {
        return this.error;
    }
}