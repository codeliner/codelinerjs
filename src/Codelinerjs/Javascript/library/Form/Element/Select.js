var Element = $CL.namespace('Cl.Form.Element');

$CL.require("Cl.Form.Element.AbstractElement");
$CL.require("Cl.Form.Validator.NotEmpty");

Element.Select = function() {};

Element.Select = $CL.extendClass(Element.Select, Element.AbstractElement, {
    options : null,
    setup : function(options) {
        Element.AbstractElement.prototype.setup.call(this, options);

        if (!$CL.has(options, "options")) {
            $CL.exception('Missing "options" key in setup options.', 'Cl.Form.Element.Select', options);
        }

        this.options = [];

        _.each(options.options, function(option) {
            if (_.isString(option)) {
                this.options.push({
                    label : option,
                    value : option
                });
            } else {
                if (!$CL.has(option, "label")) {
                    option["label"] = option.value;
                }

                this.options.push(option);
            }
        }, this);
    },
    init : function() {
        this.addValidator($CL.get('Cl.Form.Validator.NotEmpty'));
    },
    selectElement : function() {
        this.$el = $('select[name='+this.getName()+']');
        this.$el.unbind('change.form-element');
        this.$el.bind('change.form-element', $CL.bind(function(e) {
            this.isValid();
        }, this));
    },
    getOptions : function() {
        return this.options;
    }
});