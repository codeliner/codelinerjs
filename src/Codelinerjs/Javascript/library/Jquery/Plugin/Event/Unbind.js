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