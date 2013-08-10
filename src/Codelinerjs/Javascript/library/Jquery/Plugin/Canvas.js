//Canvas Plugin
(
	 function ($) {
		$.fn.extend({
			AM_getContext : function (context) {
			    if (this.length > 0)
				if (typeof this[0].getContext != "undefined")
				    return this[0].getContext(context);

			    return null;
			},
			AM_clear : function () {
			    var ctx = this.AM_getContext("2d");
			    ctx.clearRect(0, 0, this.width(), this.height());
			}
		});
	 }
 )
 (jQuery);