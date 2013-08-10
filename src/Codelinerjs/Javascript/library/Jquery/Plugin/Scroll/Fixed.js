/*
 * Plugin sorgt dafür, dass ein fixed positioniertes Element sanft mitscrolled
 */
(
	 function ($) {
		$.fn.extend({			
			smoothFixed : function (config) {
			    if (this.length > 0) {
				var $fixedEl = this;
				if (typeof config != "object")
				    config = {};
				var c = $.extend({wait : 700, speed : 500}, config);
				//document.scroll muss berücksichtig werden, da sonst positionieren beim Drücken von F5 nicht passt
				var top = this.position().top - $(document).scrollTop();
				var left = this.position().left - $(document).scrollLeft();
				var abTop = top + $(document).scrollTop();
				var abLeft = left + $(document).scrollLeft();

				$fixedEl.css({
					position : "absolute",
					top : abTop,
					left : abLeft,
					bottom : "0px",
					right : "0px"
				    });

				$(window).bind("scroll", function () {
				    window.setTimeout(function () {
					abTop  = top + $(document).scrollTop();
					abLeft = left + $(document).scrollLeft();
					$fixedEl.stop();
					$fixedEl.animate({top : abTop, left : abLeft}, c.speed);
				    }, c.wait);
				});
			    }
			}
		});
	 }
 )
 (jQuery);


