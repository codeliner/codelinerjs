var Filter = $CL.namespace('Cl.Form.Filter');

$CL.require("Cl.Core.String");

Filter.StringTrim = function() {};

Filter.StringTrim.prototype = {
    filter : function(val) {
        if (!$CL.isDefined(val) || _.isNull(val)) {
            return "";
        }
        
        return val.trim();
    }
};


