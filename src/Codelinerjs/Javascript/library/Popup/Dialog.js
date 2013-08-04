var Popup = $CL.namespace('Cl.Popup');
/*
 * benötigt ein vordefiniertes DIV, aus dem dann ein Popup generiert wird
 */
$CL.require("Cl.Popup.Store");
$CL.require("Cl.Element.Center");
$CL.require("Cl.Effect.Opacity.Black");
$CL.require("Cl.Jquery.Plugin.Ui.Dragable");
$CL.require("Cl.Jquery.Plugin.Css.Size");

Popup.Dialog = function() {
    this.SEL;
    this.$el;
    this.clsArgs = {};
    this.store = $CL.get("Cl.Popup.Store");
};

Popup.Dialog.prototype.setup = function (clsArgs) {

    if (typeof clsArgs.selector == "undefined")
        throw new Error("no selector provided for popup");

    this.SEL = clsArgs.selector;
    this.$el = $(this.SEL);
    this.clsArgs = clsArgs;

    var defs = {
        top : 0,
        left : 0,
        height : 0,
        width : 0,
        minWidth : 0,
        maxWidth : 0,
        overflow : "",
        bOp : false,
        title : false,
        minText : "minimize Window",
        maxText : "maximize Window",
        closeText : "close Window",
        position : "fixed",
        minimizedIndex : 0,
        isMinimizedObjs : false
    };

    $.extend(defs, clsArgs);
    $.extend(this, defs);

    this.exists = true;
    this.status = "closed";

    if (this.bOp)
        this.bOp = new Cl.Effect.Opacity.Black();
};

Popup.Dialog.prototype.initPopup = function () {
    var c = this;
    if ($(c.SEL).length == 0) {
        c.exists = false;
    } else {
        $(c.SEL).click(function (e) {
            c.setOnTop();
        });

        $(c.SEL).find(".popupMinimize").bind("click", function (e) {
            e.preventDefault();
            c.store.popups[c.SEL].minimize();
        });

        $(c.SEL).find(".popupClose").bind("click", function (e) {
            e.preventDefault();
            c.store.popups[c.SEL].close();
        });

        $(c.SEL).find(".popupMaximize").bind('click', function(e) {
            e.preventDefault();
            c.store.popups[c.SEL].maximize(true);
        }).hide();
    }

    c.store.addPopup(c.SEL, c);

    c.$el = $(c.SEL);

    c.$el.css(c.filterCss(c.clsArgs));
};

Popup.Dialog.prototype.filterCss = function (args) {
    var cssObj = {};
    $CL.$.each(args, function (argKey, argValue) {
        switch (argKey) {
            case "width":
            case "height":
            case "minWidth":
            case "maxWidth":
            case "top":
            case "left":
            case "position":
            case "overflow":
                cssObj[argKey] = argValue;
                break;
            default:
        //ignore
        }
    });

    return cssObj;
};

Popup.Dialog.prototype.setOnTop = function () {
    var c = this;
    c.store.increaseZIndex();
    c.$el.css("zIndex", c.store.zIndex);

};

Popup.Dialog.prototype.show = function (args) {
    var c = this;
    var def = {
        top : false,
        left : false,
        e : false,
        callback : function () {}
    };

    $.extend(def, args);

    function _showPopup () {
        var scrollVals = (c.$el.css("position") == "absolute")? true : false;
        if (!def.top)
            def.top = Cl.Element.Center(c.$el[0], scrollVals).top;

        if (!def.left)
            def.left = Cl.Element.Center(c.$el[0], scrollVals).left;


        if ( c.$el.css("display") == "none" ) {

            if (c.bOp) {
                c.bOp.on();
            }

            var docHeight = $(document).height();

            c.$el.css( {
                top:def.top,
                left:def.left
                } )
            .draggable({
                handle: ".dragBar"
            }).fadeIn(c.A_SPEED, function () {
                c.checkViewable(docHeight);
                def.callback();
            });

            return "open";
        }
        else {
            if (c.bOp) {
                c.bOp.off();
            }
            c.$el.fadeOut(c.A_SPEED, def.callback);

            return "closed";
        }
    };

    if (def.e) {
        def.e.stopPropagation();
    }


    if (c.exists && c.status == "closed") {
        c.setOnTop();
        c.status = _showPopup();

    }
    else if (c.exists && c.status == "minimized") {
        c.maximize(true);
    }
    else if (!c.exists)
        throw c.SEL+" PopupObj wurde nicht gefunden!";
};

Popup.Dialog.prototype.close = function () {
    this.$el.css("display", "none");
    this.status = "closed";
    if (this.status == "minimized")
        this.maximize(false, true);

    if (this.bOp) {
        this.bOp.off();
    }
};

Popup.Dialog.prototype.minimize = function () {
    var c = this;
    this.top = parseInt(this.$el.css("top"));
    this.left = parseInt(this.$el.css("left"));
    this.width = parseInt(this.$el.fullWidth())+"px";
    this.minWidth = (parseInt(this.$el.css("minWidth")) > 0)? this.$el.css("minWidth") : null;
    this.maxWidth = (parseInt($("#"+this.idO).css("maxWidth")) > 0)? this.$el.css("maxWidth") : null;
    this.overflow = this.$el.css("overflow");
    this.position = this.$el.css("position");

    if (isNaN(parseInt(this.$el.css("width"))))
        this.width = "auto";

    this.minimizePosition();

    var firstDragB = this.$el.find(".dragBar")[0];
    var firstMinimize = this.$el.find(".popupMinimize")[0];
    var firstMaximize = this.$el.find(".popupMaximize")[0];
    var firstClose = this.$el.find(".popupClose")[0];

    $(firstDragB).css({
        cursor: "default"
    });


    $(firstMinimize).hide();
    $(firstMaximize).show();

    $(firstClose).unbind().bind("click", function (e) {
        e.preventDefault();
        window.setTimeout(function () {
            c.maximize(false, true);
        }, 1000 );
        c.close();
    });

    if (this.bOp)
        this.bOp.off();

    this.$el.find(".modal-body").css("display", "none");
    this.$el.find(".modal-footer").css("display", "none");

    var title = "";

    if (this.title) {
        title = this.title;
    } else {
        title = this.$el.find(".modal-header h3").html();
    }
    this.$el.find(".modal-header h3").hide();
    this.$el.find(".modal-header").append($("<span />").html(title).addClass("popupTitle"));

    this.status = "minimized";
    return false;
};

Popup.Dialog.prototype.minimizePosition = function () {
    var c = this;
    var screenWidth = Cl.Element.WindowMass().width;
    var popupAnzahl = parseInt(screenWidth / 260);
    var layer = (this.store.minimized > 0)? parseInt(this.store.minimized / popupAnzahl ) : 0;

    var right = (this.store.minimized * 200) - (popupAnzahl * layer * 200);
    var bottom = 60 * layer;

    this.minimizedIndex = this.store.minimized;

    this.store.addMinimizedObj(this.minimizedIndex, this);
    this.isInMinimizedObjs = true;

    this.$el.css({
        top:"auto",
        left:"auto",
        bottom:bottom + "px",
        right:right + "px",
        width:"200px",
        minWidth : "auto",
        maxWidth : "auto",
        overflow:"hidden",
        position:"fixed",
        zIndex:10000
    }).draggable("option", "disabled", true);
};

Popup.Dialog.prototype.maximize = function (setStatus, isClosing) {
    var c = this;
    if (typeof setStatus == "undefined")
        setStatus = true;

    if (typeof isClosing == "undefined")
        isClosing = false;

    this.orderMinimized();
    this.setOnTop();


    var firstDragB = this.$el.find(".dragBar")[0];
    var firstMinimize = this.$el.find(".popupMinimize")[0];
    var firstMaximize = this.$el.find(".popupMaximize")[0];
    var firstClose = this.$el.find(".popupClose")[0];

    $(firstDragB).css({
        cursor: "move"
    });

    $(firstMinimize).show();
    $(firstMaximize).hide();

    $(firstClose).unbind("click").bind("click", function (e) {
        e.preventDefault();
        window.setTimeout(function () {
            c.maximize(false, true);
        }, 1000 );
        c.close();
    });

    this.$el.find(".modal-body").css("display", "block");
    this.$el.find(".modal-footer").css("display", "block");

    this.$el.find(".modal-header .popupTitle").remove();
    this.$el.find(".modal-header h3").show();

    if (setStatus) {
        this.status = "open";

        if (this.bOp)
            this.bOp.on();
    }


    this.$el.css({
        top:c.top+"px",
        left:c.left+"px",
        bottom:"auto",
        right:"auto",
        width:c.width,
        overflow:c.overflow,
        position:c.position
    }).draggable("option", "disabled", false);


    this.$el.css("minWidth", this.minWidth);

    this.$el.css("maxWidth", this.maxWidth);

    return false;
};

Popup.Dialog.prototype.orderMinimized = function () {
    if (this.isInMinimizedObjs) {
        var i = this.store.minimizedObjs.length-1;

        var cObj = {};
        var dropedObjs = new Array();

        for (i; i >= 0; i--) {
            cObj = this.store.minimizedObjs[i];

            if (cObj.minimizedIndex > this.minimizedIndex) {
                dropedObjs[dropedObjs.length] = this.store.minimizedObjs.pop();
                this.store.decreaseMinimized();
            } else if (cObj.minimizedIndex == this.minimizedIndex) {
                this.store.minimizedObjs.pop();
                this.store.decreaseMinimized();
                this.isInMinimizedObjs = false;
            }
        }

        var dI = dropedObjs.length - 1;

        for (dI; dI >= 0; dI--) {
            dropedObjs[dI].minimizePosition();
        }
    }
};

Popup.Dialog.prototype.isNotOpen = function () {
    return this.status != "open";
};

Popup.Dialog.prototype.isInViewport = function () {
    var viewportTop = $(document).scrollTop();
    var viewportBottom = viewportTop + $CL.$(window).height();

    return this.$el.offset().top >= viewportTop && this.$el.offset().top <= viewportBottom;
};

Popup.Dialog.prototype.checkViewable = function (docHeight) {
    var c = this;

    if (typeof docHeight == "undefined")
        docHeight = false;

    if (c.$el.fullHeight() > $(window).height()) {
        if (c.$el.css("position") == "fixed") {
            c.$el.css("position", "absolute");
            c.position = "absolute";
            c.close();
            c.show();
        }

    }

    if (docHeight && c.position == "absolute") {
        var ppBottom = c.$el.offset().top + c.$el.fullHeight();

        if (ppBottom > docHeight) {
            var diff = ppBottom - docHeight;

            c.$el.css({
                top : c.$el.offset().top - diff
            });
        }
    }

    c.$el.draggable("option", "containment", "document");
};