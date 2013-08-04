var Opacity = $CL.namespace('Cl.Effect.Opacity');

$CL.require('Cl.Effect.Opacity.Opacity');

Opacity.Black = function() {
    this.isOn = false;
    this.EL_ID = "blackOpacity";
    this.IMG_ID = "bOpLoadImg";
    this.imgLoadingUrl = "/img/loading.gif";
    this.css = {
	 position : "fixed",
	 top : "0px",
	 left : "0px",
	 width : "100%",
	 height : "100%",
	 backgroundColor : "#000",
	 opacity : "0.5",
	 zIndex : "10000"
    };
};

Opacity.Black = $CL.extendClass(Opacity.Black, Opacity.Opacity);

if (typeof $CL.effects != "object")
    $CL.effects = {};

$CL.effects.bOp = new Opacity.Black();