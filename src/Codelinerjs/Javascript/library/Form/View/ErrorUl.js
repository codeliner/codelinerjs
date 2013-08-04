var View = $CL.namespace('Cl.Form.View');

View.ErrorUl = {
    print : function(errors, elementName, onlyFirst) {
        var html = "";

        if ($CL.isDefined(elementName)) {
            if (!$CL.isDefined(errors[elementName])) {
                return html;
            }

            errors = { elementName : errors[elementName]};
        }

        if (!$CL.isDefined(onlyFirst)) {
            onlyFirst = true;
        }

        if ($CL.isEmpty(errors)) {
            return html;
        }

        html = '';

        var count = 0;

        _.each(errors, function(errors) {
           _.each(errors, function(error) {
               if (onlyFirst && count > 0) {
                   return;
               }
               html += '<div class="alert alert-error">' + error.msg + '</div>';
               count++;
           });
        });

        return html;
    }
}