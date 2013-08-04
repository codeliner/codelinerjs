var Opacity = $CL.namespace('Cl.Effect.Opacity');

Opacity.Opacity = function() {
    this.isOn = false;
    this.EL_ID = "pageOpacity";
    this.IMG_ID = "bOpLoadImg";
    this.imgLoadingUrl = "/img/loading.gif";
    this.css = {
        position : "fixed",
        top : "0px",
        left : "0px",
        width : "100%",
        height : "100%",
        zIndex : "100000"
    };
    this.className = null;
};

(function (cl) {
    cl.prototype.setup = function (clArgs) {
        cl = this;

        if ($CL.has(clArgs, 'className')) {
            cl.className = clArgs.className;
        } else {

            if (typeof cl['css'] === 'undefined') {
                if (typeof clArgs['css'] === 'undefined') {
                    $CL.exception('no css proberties provided for opacity div', Cl_Effect_Opacity, clArgs);
                }

                for (var key in clArgs.css) {
                    cl.css[key] = clArgs.css[key];
                }
            }
        }



        if (typeof clArgs['imgLoadingUrl'] !== 'undefined') {
            cl.imgLoadingUrl = clArgs.imgLoadingUrl;
        }
    };

    cl.prototype.on = function (loading) {
        var cl = this;
        var $opacityDiv = $("<div />").attr({
            id : cl.EL_ID
        })
        .appendTo('body');
        cl.setStyle($opacityDiv);

        if (typeof loading != "undefined" && loading === true) {
            $("<img />").attr({
                src : cl.imgLoadingUrl,
                id : cl.IMG_ID
            }).css({
                position : "fixed",
                top:"47%",
                left:"47%",
                zIndex:10000
            }).appendTo("body");
        }
        else {
            var opacityVal = cl.getOpacityVal($opacityDiv);

            this.isOn = true;
            $opacityDiv.css("opacity", "0.0").animate({
                opacity : opacityVal
            }, 800);
        }
    };

    cl.prototype.setStyle = function ($div) {
        var cl = this;

        $div.css(cl.css);

        if (cl.isClassName()) {
            $div.addClass(cl.className);
        }
    };

    cl.prototype.isClassName = function () {
        return typeof this.className !== 'undefined';
    };

    cl.prototype.getOpacityVal = function ($div) {
        var opacityVal = '0.5';

        if (typeof $div.css('opacity') !== 'undefined') {
            opacityVal = $div.css('opacity');
        }

        return opacityVal;
    };

    cl.prototype.off = function () {
        var c = this;
        if (typeof $("#"+c.IMG_ID)[0] != "undefined")
            $("#"+c.IMG_ID).remove();

        if (typeof $("#"+c.EL_ID)[0] != "undefined") {
            $("#"+c.EL_ID).animate({
                opacity : "0.0"
            }, 800, function () {
                $("#"+c.EL_ID).remove();
                c.isOn = false;
            });
        }
    };

    cl.prototype.fastOff = function () {
        var c = this;

        if (typeof $("#"+c.EL_ID)[0] != "undefined") {
            $("#"+c.EL_ID).remove();
        }
    }
})(Opacity.Opacity);