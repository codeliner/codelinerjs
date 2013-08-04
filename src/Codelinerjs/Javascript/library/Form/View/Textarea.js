var View = $CL.namespace('Cl.Form.View');

$CL.require('Cl.Form.View.ErrorUl');

View.Textarea = {
    print : function(element, errors, displayErrorMsgs) {
        var html = "";

        if (!$CL.isDefined(displayErrorMsgs)) {
            displayErrorMsgs = true;
        }

        if (displayErrorMsgs) {
            html += Cl.Form.View.ErrorUl.print(errors, element.getName());
        }

        if (!_.isNull(element.getLabel())) {
            html += '<label for="'+element.getName()+'"><span>'+element.getLabel()+'&nbsp;</span></label>';
        }

        html += '<textarea name="'+element.getName()+'" type="text" ';
        html += ($CL.isDefined(errors[element.getName()]))? 'class="' + element.errorClass + '"' : '';
        html += '>' + _.escape(element.getValue()) + '</textarea>';

        return html;
    }
};