//fullWidth, gibt die Weite zurück, die man dann auch wieder setzten kann, um dem Element die org-Weite zu geben
 (
	 function ($) {
		$.fn.extend({
			fullWidth : function () {
				if ($.browser.msie && parseInt($.browser.version) < 9) {
				    return this.width();
				} else
				    return this.outerWidth();
			}
		});
	 }
 )
 (jQuery);

 //fullHeight, gibt die Höhe zurück, die man dann auch wieder setzten kann, um dem Element die org-Höhe zu geben
 (
	 function ($) {
		$.fn.extend({
			fullHeight : function () {
				if ($.browser.msie && parseInt($.browser.version) < 9)  {
				    return this.height();
				} else
				    return this.outerHeight();
			}
		});
	 }
 )
 (jQuery);