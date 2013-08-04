function Cl_Jquery_Plugin_Event_Unbind () {

};

//unbindAll
 (
	 function ($) {
		$.fn.extend({
			unbindAll : function (handler) {
			    this.each(function (index, obj) {
				obj["on"+handler] = null;
				$(obj).unbind(handler);
			    });

			    return this;
			}
		});
	 }
 )
 (jQuery);