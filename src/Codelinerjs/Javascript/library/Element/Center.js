var Element = $CL.namespace('Cl.Element');

$CL.require('Cl.Element.WindowMass');

Element.Center = function(e, scrollVals) {
    if (typeof scrollVals == "undefined")
	    scrollVals = true;

	var w = {},	scroll = {};


	w.height = Cl.Element.WindowMass().height;
	w.width = Cl.Element.WindowMass().width;

	scroll.top = $(window).scrollTop();
	scroll.left = $(window).scrollLeft();

	var top = parseInt((w.height/2) - ($(e).outerHeight()/2));
	var left = parseInt((w.width/2) - ($(e).outerWidth()/2));

	var dif = 0;

	if ($(e).outerHeight() > (w.height-top))
	{
		dif = $(e).outerHeight() - (w.height-top);
		top = top - dif;
	}


	if ($(e).outerWidth() > (w.width-left))
	{
		dif = $(e).outerWidth() - (w.width-left);
		left = left - dif;
	}

	if (scrollVals) {
	    top += scroll.top;
	    left += scroll.left;

	    if (top <= scroll.top)
		 top = scroll.top + 10;

	    if (left <= scroll.left)
		 left = scroll.left + 10;
	}

	return {top:top, left:left};
}

