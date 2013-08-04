var Form = $CL.namespace("Cl.Form");

$CL.require('Cl.Event.Manager');
$CL.require('Cl.Form.Event.FormData');

Form.Form = function() {};

Form.Form.prototype = {
    name : null,
    elements : [],
    elementErrors : {},
    events : function() {
        if (!$CL.has(this, "__eventManager")) {
            this["__eventManager"] = $CL.get("event_manager", {
                target : $CL.className(this) + '.' + this.name
            });
        }

        return this["__eventManager"];
    },
    setup : function(options) {
        if ($CL.isDefined(options.name)) {
            this.name = options.name;
        }

        if ($CL.isDefined(options.elements)) {
            this.elements = options.elements;
        }
    },
    addElement : function(element) {
        this.elements.push(element);
    },
    getElement : function(name) {
        return _.find(this.elements, function(el) {
            return el.getName() == name;
        });
    },
    setData : function(data) {
        $.each(data, $CL.bind(function(key, value) {
            var el = this.getElement(key);
            el.setValue(value);
        }, this));
    },
    getData : function() {
        var data = {};

        _.each(this.elements, function(element) {
            data[element.getName()] = element.getValue();
        });

        var formDataEvent = $CL.makeObj('Cl.Form.Event.FormData');
        formDataEvent.setFormData(data);

        this.events().trigger(formDataEvent);
        data = formDataEvent.getFormData();
        return data;
    },
    isValid : function() {
        var valid = true;
        this.elementErrors = {};

        _.each(this.elements, function(element) {
            if (!element.isValid()) {
                valid = false;
                var elErrors = {};
                this.elementErrors[element.getName()] = element.getErrors();
            }
        }, this);

        return valid;
    },
    setErrors : function(elementErrors) {
        this.elementErrors = elementErrors;
        $.each(elementErrors, $CL.bind(function(elementName, errors) {
            var el = this.getElement(elementName);
            el.setErrors(errors);
        }, this));
    },
    getErrors : function() {
        return this.elementErrors;
    },
    refresh : function() {
        _.each(this.elements, function(element) {
            element.refresh();
        });
    }
}