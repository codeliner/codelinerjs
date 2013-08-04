var View = $CL.namespace('Cl.Form.View');

$CL.require('Cl.Form.View.ErrorUl');

View.Password = {
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

        html += '<input name="'+element.getName()+'" type="password" value="'+_.escape(element.getValue())+'"';
        html += ($CL.isDefined(errors[element.getName()]))? ' class="' + element.errorClass + '"' : '';
        html += ' />';

        if (!_.isNull(element.getLabel())) {
            html += '</label>';
        }

        return html;
    }
};