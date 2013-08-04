function Cl_Picture_Zoom () {
    
    /**
     * #ie-Bug: mouseover don't fire on empty divs
     * #hack: set background to a color (transparent not work) and opacity/filter: alpha(opacity) 0
     */
    
    this.zoomWidth;
    this.zoomHeight;
    this.zoomSrc;
    /**
     * possible modes: 
     * 
     * PicOverPicZoom -> zoomed pic as a layer over small pic <- default
     * PicBesidePicZoom -> zoomed pic as a layer left or right side the small pic
     * PicViewportZoom -> zoomed pic as a layer left or right side the small pic with viewport over small pic
     * PicLoupeViewport -> zoomed pic as a viewport layer over small pic
     */
    this.mode = "PicOverPicZoom";
    
    this.factor;
    
    this.imgObj;
    this.imgZindex;
    
    this.$layer;
    this.layerWdith;
    this.layerHeight;
    this.$outerLayer;
    this.$sideLayer;
    this.$loupe;
    
    //PicOverPicZoom, PicBesidePicZoom, PicLoupeViewport use this to create a "border" 
    //where zoom has reached the end, but is shown until cursor liefs the padding  
    this.layerPadding = 20;
    
    //is used by PicBesidePicZoom
    this.layerMargin = 10;
    this.layerFloat  = "right";
    
    this.mouseX;
    this.mouseY;
    this.mouseFactor;
    this.lastTS;
    
    var _bgTarget;
    
    this.getBgTarget = function () {
        if (!$CL.is(_bgTarget)) {
            $CL.exception("no backgroundImage Target defined");
        }
        
        return _bgTarget;
    };
    
    this.setBgTarget = function (bgTarget) {
        _bgTarget = bgTarget;
    };
};

(function (cl) {
    cl.prototype.setup = function (options) {
        var c = this;       
        if ($CL.has(options, "zoomWidth")) {            
            for (var key in options) {
                c[key] = options[key];
            }
        }
    };

    cl.prototype.init = function () {
        var c = this;
        
        if (!$CL.isEmpty(c.imgObj)) {     
            
            c.imgZindex = parseInt(c.imgObj.get("$el").css("zIndex")) + 1;
            if (isNaN(c.imgZindex))
                c.imgZindex = 0;
           
            
            switch (c.mode) {
                case "PicBesidePicZoom":
                    _getFactors(c);
                    _setupPicOverPicZoom(c);
                    _setupSideLayer(c);
                    c.setBgTarget(c.$sideLayer);
                    break;
                case "PicViewportZoom":
                    c.layerPadding = 0;
                    _getFactors(c);
                     _setupPicViewportZoom(c);
                    _setupSideLayer(c);
                    c.setBgTarget(c.$sideLayer);
                    break;
                case "PicLoupeViewport":
                    _getFactors(c);                   
                    _setupLoupeZoom(c);
                    c.setBgTarget(c.$loupe);
                    break;
                case "PicOverPicZoom":
                default:
                    _getFactors(c);                   
                    _setupPicOverPicZoom(c);
                    c.setBgTarget(c.$outerLayer);
            }            
        }
    };
    
    function _getFactors (obj) {
        var c = obj;
        
        c.layerWidth = c.imgObj.get("width") - (c.layerPadding * 2);
        var layerFactor = c.imgObj.get("width") / c.layerWidth;

        c.layerHeight = Math.round(c.imgObj.get("height") / layerFactor);

        c.factor = c.zoomWidth / c.imgObj.get("width");
        c.mouseFactor = c.imgObj.get("width") / c.layerWidth;

        if (Math.round(c.zoomHeight / c.factor) != c.imgObj.get("height")) {
            $CL.exception("orgScale and zoomScale have not the same scale-factor", "Cl_Picture_Zoom", c.factor);
        }        
    };
    
    function _setupPicViewportZoom (obj) {
        var c = obj;
        
        var viewPortWidth = Math.round(c.imgObj.get("width") / c.factor);
        var viewPortHeight = Math.round(c.imgObj.get("height") / c.factor);
        
        var viewPortMiddleX = Math.round(viewPortWidth / 2);
        var viewPortMiddleY = Math.round(viewPortHeight / 2);
        
        c.$viewPort = $("<div />").css({
                position : "absolute", 
                top : -1000 + "px",
                left : -1000 +"px",
                width : viewPortWidth,
                height : viewPortHeight,
                backgroundColor : "white",
                opacity : "0.5",
                zIndex : c.imgZindex + 2
            })
            .addClass("img_zoom_viewport")
            .mouseover(function (e) {                
                $(this).trigger("mousemove");
                
                 c.getBgTarget().css({
                    backgroundImage : "url(" + c.zoomSrc + ")"
                });
            }) 
            .mousemove(function (e, orgEvent) {
                if ($CL.is(e.pageX) || $CL.is(orgEvent)) {
                    var pageX = ($CL.has(e, "pageX"))? e.pageX : orgEvent.pageX;
                    var pageY = ($CL.has(e, "pageY"))? e.pageY : orgEvent.pageY;
                } else 
                    return false;
                
                var ts = new Date();
                if (!$CL.is(c.lastTS) || (ts.getTime() - c.lastTS) > 41) {
                    c.lastTS = ts.getTime();
                    var mouseX = Math.round(pageX - c.$layer.offset().left);
                    var mouseY = Math.round(pageY - c.$layer.offset().top); 
                    
                    var viewPortLeft = mouseX - viewPortMiddleX;
                    var viewPortTop = mouseY - viewPortMiddleY;
                    
                    if (viewPortLeft < 0)
                        viewPortLeft = 0;
                    
                    if ((viewPortLeft + viewPortWidth) > c.$layer.width())
                        viewPortLeft = (c.$layer.width() - viewPortWidth );
                    
                    if (viewPortTop < 0)
                        viewPortTop = 0;
                    
                    if ((viewPortTop + viewPortHeight) > c.$layer.height())
                        viewPortTop = (c.$layer.height() - viewPortHeight);
                    
                    c.getBgTarget().css({
                        backgroundPosition : ((viewPortLeft * c.factor) * -1)+"px "+ ((viewPortTop * c.factor) * -1)+"px"
                    });
                    
                    c.$viewPort.css({
                        top : c.$layer.offset().top + viewPortTop,
                        left : c.$layer.offset().left + viewPortLeft
                    });
                }
            })       
            .mouseout(function (e) {                
                c.getBgTarget().css({
                    backgroundImage : "url()"
                });
                
                c.$viewPort.css({
                    top : -1000,
                    left : -1000
                });
            })                 
            .appendTo("body");
            
            c.$layer = $("<div />").css({
                position : "absolute",
                top : c.imgObj.get("$el").offset().top,
                left : c.imgObj.get("$el").offset().left,
                zIndex : c.imgZindex + 1,
                width : c.layerWidth,
                height : c.layerHeight,
                background : "#000",
                opacity : 0.0
            })
            .addClass("img_zoom")
            .mouseover(function (e) {
                c.getBgTarget().css({
                    backgroundImage : "url(" + c.zoomSrc + ")"
                });
                
                $(c.$viewPort).trigger("mousemove", e);
            })
            .mousemove(function (e) {
                c.getBgTarget().css({
                    backgroundImage : "url(" + c.zoomSrc + ")"
                });
                
                $(c.$viewPort).trigger("mousemove", e);
            })
            .appendTo("body");
    };
    
    function _setupLoupeZoom (obj) {
        var c = obj;
        c.$outerLayer = $("<div />").css({
            position : "absolute",
            top : c.imgObj.get("$el").offset().top,
            left : c.imgObj.get("$el").offset().left,
            width : c.imgObj.get("width"),
            height : c.imgObj.get("height"),
            zIndex : c.imgZindex + 1,
            background : "#000",
            opacity : 0.0
            
        })         
        .mouseenter(function (e) {
            c.$loupe.fadeIn(400);
            $(c.$loupe).trigger("mousemove", e);

             c.getBgTarget().css({
                backgroundImage : "url(" + c.zoomSrc + ")"
            });
        })
        .mousemove(function (e) {
            $(c.$loupe).trigger("mousemove", e);
        })
        .appendTo("body");

        c.$layer = $("<div />").css({
            position : "absolute",
            top : ((c.imgObj.get("height") - c.layerHeight) / 2 ),
            left : ((c.imgObj.get("width") - c.layerWidth) / 2),
            width : c.layerWidth,
            height : c.layerHeight,
            background : "#000",
            opacity : 0.0
        })    
        .appendTo(c.$outerLayer);

        c.$loupe = $("<div />").css({
            width : 180,
            height : 180,
            border : "2px solid #eee",
            borderRadius : "90px",
            position : "absolute",
            zIndex : c.imgZindex + 3,
            display : "none",
            cursor : "url('/images/blank.cur'),default"
        })
        .addClass("img_zoom_loupe")
        .mousemove(function (e, orgEvent) {
            
            if ($CL.is(e.pageX) || $CL.is(orgEvent)) {
                var pageX = ($CL.has(e, "pageX"))? e.pageX : orgEvent.pageX;
                var pageY = ($CL.has(e, "pageY"))? e.pageY : orgEvent.pageY;
            } else 
                return false;
            
            
            
            var ts = new Date();
            if (!$CL.is(c.lastTS) || (ts.getTime() - c.lastTS) > 41) {
                c.lastTS = ts.getTime();
                var mouseX = Math.round(pageX - c.$layer.offset().left);
                var mouseY = Math.round(pageY - c.$layer.offset().top);
                
                c.$loupe.css({
                    left : mouseX - (c.$loupe.width() / 2) + c.$layer.offset().left,
                    top : mouseY - (c.$loupe.height() / 2) + c.$layer.offset().top
                });                
                
                if (mouseX > c.$layer.width()) {
                    mouseX = c.$layer.width();
                    
                }

                if (mouseY > c.$layer.height() ) {
                    mouseY = c.$layer.height();
                    
                }                
                
                mouseX = mouseX - Math.round((c.$loupe.width() / Math.PI));
                mouseY = mouseY - Math.round((c.$loupe.height() / Math.PI));
                
                if (mouseX < 0)
                    mouseX = 0;
                
                if (mouseY < 0)
                    mouseY = 0;

                mouseX = Math.round(mouseX * c.mouseFactor);
                mouseY = Math.round(mouseY * c.mouseFactor);
                
                if (pageX < c.$outerLayer.offset().left || 
                    pageX > (c.$outerLayer.offset().left + c.$outerLayer.width()) ||
                    pageY < c.$outerLayer.offset().top ||
                    pageY > (c.$outerLayer.offset().top + c.$outerLayer.height())
                ) {
                    c.$loupe.fadeOut(400);
                }

                c.getBgTarget().css({
                    backgroundPosition : ((mouseX * c.factor) * -1)+"px "+ ((mouseY * c.factor) * -1)+"px"
                });
            }
        }) 
        .appendTo("body");
    };
    
    function _setupPicOverPicZoom (obj) {
        var c = obj;
        c.$outerLayer = $("<div />").css({
                position : "absolute",
                top : c.imgObj.get("$el").offset().top,
                left : c.imgObj.get("$el").offset().left,
                width : c.imgObj.get("width"),
                height : c.imgObj.get("height"),
                zIndex : c.imgZindex + 1
            })          
            .mouseover(function (e) {                
                $(this).trigger("mousemove");
                
                 c.getBgTarget().css({
                    backgroundImage : "url(" + c.zoomSrc + ")"
                });
            })
            .mousemove(function (e) {                 
                var ts = new Date();
                if (!$CL.is(c.lastTS) || (ts.getTime() - c.lastTS) > 41) {
                    c.lastTS = ts.getTime();
                    var mouseX = Math.round(e.pageX - c.$layer.offset().left);
                    var mouseY = Math.round(e.pageY - c.$layer.offset().top);             
                  
                    
                    if (mouseX < 0)
                        mouseX = 0;
                    
                    if (mouseX > c.$layer.width())
                        mouseX = c.$layer.width();
                    
                    if (mouseY < 0)
                        mouseY = 0;
                    
                    if (mouseY > c.$layer.height())
                        mouseY = c.$layer.height();
                    
                    mouseX = Math.round(mouseX * c.mouseFactor);
                    mouseY = Math.round(mouseY * c.mouseFactor);

                    c.getBgTarget().css({
                        backgroundPosition : (mouseX - (mouseX * c.factor))+"px "+ (mouseY - (mouseY * c.factor))+"px"
                    });
                }
            })       
            .mouseout(function (e) {                
                c.getBgTarget().css({
                    backgroundImage : "url()"
                });
            })
            .addClass("img_zoom")
            .appendTo("body");
            
            c.$layer = $("<div />").css({
                position : "absolute",
                top : c.imgObj.get("$el").offset().top + ( (c.imgObj.get("height") - c.layerHeight) / 2 ),
                left : c.imgObj.get("$el").offset().left + ( (c.imgObj.get("width") - c.layerWidth) / 2),
                zIndex : c.imgZindex + 2,
                width : c.layerWidth,
                height : c.layerHeight,
                background : "#000",
                opacity : 0.0
            })
            .addClass("img_zoom")
            .mouseover(function (e) {               
                c.getBgTarget().css({
                    backgroundImage : "url(" + c.zoomSrc + ")"
                });
                
                $(this).trigger("mousemove");
            })  
            .mousemove(function (e) {                
                var ts = new Date();
                if (!$CL.is(c.lastTS) || (ts.getTime() - c.lastTS) > 41) {
                    c.lastTS = ts.getTime();
                    var mouseX = Math.round(e.pageX - c.$layer.offset().left);
                    var mouseY = Math.round(e.pageY - c.$layer.offset().top);
                    
                    mouseX = Math.round(mouseX * c.mouseFactor);
                    mouseY = Math.round(mouseY * c.mouseFactor);

                    c.getBgTarget().css({
                        backgroundPosition : (mouseX - (mouseX * c.factor))+"px "+ (mouseY - (mouseY * c.factor))+"px"
                    });
                }
            })            
            .appendTo("body");
    };
    
    function _setupSideLayer (obj) {
        var c = obj;
        
        var siteLayerLeft;
        
        if (c.layerFloat == "right") {
            siteLayerLeft = c.imgObj.get("$el").offset().left + c.imgObj.get("width") + c.layerMargin;
        } else {
            siteLayerLeft = c.imgObj.get("$el").offset().left - c.layerMargin - c.imgObj.get("width");
        }
        
        c.$sideLayer = $("<div />").css({
            position : "absolute",
            top : c.imgObj.get("$el").offset().top,
            left : siteLayerLeft,
            width : c.imgObj.get("width"),
            height : c.imgObj.get("height"),
            backgroundColor : "transparent",
            backgroundImage : "url()",
            backgroundRepeat : "no-repeat",
            backgroundPosition : "0px 0px"
        })
        .addClass("img_zoom_viewport")
        .appendTo("body");
    }
})(Cl_Picture_Zoom);