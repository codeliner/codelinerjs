var Paginator = $CL.namespace("Cl.Paginator");

Paginator.AdapterInterface = function ClPaginatorAdapter() {};

Paginator.AdapterInterface.prototype = {
    getItems : function() {
        $CL.implementThis();
    },
    getCurrentPage : function() {
        $CL.implementThis();
    },
    getPageCount : function() {
        $CL.implementThis();
    },
    getPageLink : function(pageNumber) {
        $CL.implementThis();
    }
};