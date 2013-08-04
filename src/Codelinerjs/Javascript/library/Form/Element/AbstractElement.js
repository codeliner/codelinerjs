var Element = $CL.namespace('Cl.Form.Element');

Element.AbstractElement = function() {};

Element.AbstractElement.prototype = {
    name : null,
    label : null,
    filters : null,
    validators : null,
    $el : null,
    errorClass : "failed",
    passedClass : "passed",
    required : true,
    errors : [],
    elSelector : "",
    _valueProvider : function(val) {
        if (!$CL.isDefined(val)) {
            return this.$el.val();
        } else {
            this.$el.val(val);
        }
    },
    setErrors : function(errors) {
        this.errors = errors;
        this.setErrorClass();
    },
    getErrors : function() {
        return this.errors;
    },
    setErrorClass : function() {
        this.$el.addClass(this.errorClass);
        this.$el.removeClass(this.passedClass);
    },
    setPassed : function() {
        this.$el.removeClass(this.errorClass);
        this.$el.addClass(this.passedClass);
        this.errors = [];
    },
    setup : function(options) {
        if ($CL.isDefined(options.name)) {
            this.name = options.name;
        }

        if ($CL.isDefined(options.label)) {
            this.label = options.label;
        }

        if ($CL.isDefined(options.filters)) {
            this.filters = options.filters;
        } else {
            this.filters = [];
        }

        if ($CL.isDefined(options.validators)) {
            this.validators = options.validators;
        } else {
            this.validators = [];
        }

        if ($CL.isDefined(options.selector)) {
            this.elSelector = options.selector;
        }

        if ($CL.isDefined(options.required)) {
            this.required = options.required;
        }

        this.selectElement();
    },
    selectElement : function() {
        this.$el = $(this.elSelector);
    },
    setElement : function($el) {
        this.$el = $el;
    },
    setName : function(name) {
        this.name = name;
    },
    setLabel : function(label) {
        this.label = label;
    },
    addFilter : function(filter) {
        this.filters.push(filter);
    },
    addValidator : function(validator) {
        this.validators.push(validator);
    },
    getName : function() {
        return this.name;
    },
    getLabel : function() {
        return this.label;
    },
    getValue : function() {
        var val = this._valueProvider();

        _.each(this.filters, function(filter) {
            val = filter.filter(val);
        });

        return val;
    },
    setValue : function(val) {
        this._valueProvider(val);
    },
    isValid : function() {
        var valid = true;
        var val = this.getValue();
        this.errors = [];

        if (!this.required && $CL.isEmpty(val)) {
            this.setPassed();
            return true;
        }

        _.each(this.validators, function(validator) {
            if (!validator.isValid(val)) {
                var error = validator.getError();
                this.errors.push(error);
                valid = false;
            }
        }, this);

        if (!valid) {
            this.setErrorClass();
        } else {
            this.setPassed();
        }

        return valid;
    },
    refresh : function() {
        this.selectElement();
    }
};