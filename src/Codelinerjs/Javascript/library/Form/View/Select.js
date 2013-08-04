var View = $CL.namespace('Cl.Form.View');

$CL.require('Cl.Form.View.ErrorUl');

View.Select = {
    print : function(element, errors, displayErrorMsgs) {
        var html = "";

        if (!$CL.isDefined(displayErrorMsgs)) {
            displayErrorMsgs = true;
        }

        if (displayErrorMsgs) {
            html += Cl.Form.View.ErrorUl.print(errors, element.getName());
        }

        if (!_.isNull(element.getLabel())) {
            html += '<label for="'+element.getName()+'"><span>'+element.getLabel()+'&nbsp;</span>';
        }

        html += '<select name="'+element.getName()+'"';
        html += ($CL.isDefined(errors[element.getName()]))? ' class="' + element.errorClass + '"' : '';
        html += '>';

        _.each(element.getOptions(), function(option) {
            html += '<option value="' + option.value + '"';
            html += ($CL.isDefined(option['selected'] && option['selected']))? ' selected>' : '>';
            html += _.escape(option.label) + '</option>';
        });

        html += '</select>';

        if (!_.isNull(element.getLabel())) {
            html += '</label>';
        }

        return html;
    }
};