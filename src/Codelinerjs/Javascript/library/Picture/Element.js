function Cl_Picture_Element () {
    
    var params = {
        $el : false,
        id : null,
        name : null,
        type : null,
        src : null,
        title : null,
        alt : null,
        tags : null,
        width : null,
        height : null,
        uploadObj : false,
	uploadIndex : 0,
	uploadCallback : function () {},
        $dataInput : false,
	LOAD_IMG_SRC : "#",
	LOAD_IMG_WIDTH : 0,
	LOAD_IMG_HEIGHT : 0,
	EMPTY_IMG_SRC : "#",
	EMPTY_IMG_WIDTH : 0,
	EMPTY_IMG_HEIGHT : 0,
        zoomObj : null
    }
    
    this.get = function (key) {
        return params[key];
    };
    
    this.set = function (key, value, setup) {
        params[key] = value;
        
        if (typeof setup == "undefined")
            setup = false;
        
        if (!setup && params["$dataInput"]) {
            this.refreshDataInput();
        }
        return this;
    }
    
    this.refreshDataInput = function () {
        var dataInput = {};
        $.each(params, function (key, value) {
            switch (key) {
                case "id":
                case "name":
                case "type":
                case "src":
                case "title":
                case "alt":
                case "tags":
                case "width":
                case "height":
		case "LOAD_IMG_SRC":
		case "LOAD_IMG_WIDTH":
		case "LOAD_IMG_HEIGHT":
		case "EMPTY_IMG_SRC":
		case "EMPTY_IMG_WIDTH":
		case "EMPTY_IMG_HEIGHT":
                    dataInput[key] = value;
                    break;
                default:
                    //ignore
            }
        });
        
        this.get("$dataInput").val(JSON.stringify(dataInput));
    }
};

(function (cl) {
    cl.prototype.setup = function (options) {
	var c = this;
	if ($CL.is(options)) {
	    for (var key in options) {
		c.set(key, options[key], true);
	    }
            
            if (c.get("$dataInput"))
                c.loadFromInput();
            
            if (c.get("$el")) {
                if ($CL.is(c.get("$el").data("img-data"))) {
                    c.setFromPicArr(c.get("$el").data("img-data"));                    
                }
            }
	}
    };
    
    cl.prototype.init = function () {
        var c = this;
        
        if (c.get("$el")) {            
            c.refresh();
        }
    };
    
    cl.prototype.refresh = function () {
        var c = this;
        
        if (c.get("$el")) {            
            c.get("$el").attr({
               src : c.get("src"),
               alt : c.get("alt"),
               title : c.get("title")
            }).css({
                width : c.get("width"),
                height : c.get("height")
            });
        }
    };
    
    cl.prototype.reset = function () {		
	this.set("id", "");
	this.set("name", "");
	this.set("type", "");
	this.set("title", "");
	this.set("alt", "");
	this.set("tags", "");
	this.set("width", this.get("EMPTY_IMG_WIDTH"));
	this.set("height", this.get("EMPTY_IMG_HEIGHT"));
	this.set("src", this.get("EMPTY_IMG_SRC"));
        
        var $newImg = $("<img />");
		
        this.get("$el").replaceWith($newImg);
        this.set("$el", $newImg);
        
	this.refresh();
    };
    
    cl.prototype.setFromPicArr = function (picArr) {
	var c = this;
	$.each(picArr, function (key, value) {	    
	    c.set(key, value);
	});
	
	c.refresh();
    }
    
    cl.prototype.loadFromInput = function () {
        var c  = this;
       
        try {
            var options = JSON.parse(c.get("$dataInput").val());
        } catch (e) {
            $CL.log(e);
        }
        
        for (var key in options) {
            c.set(key, options[key], true);
        }
    };
    
    cl.prototype.connectWithUpload = function (upObj, upObjIndex) {
        var c = this;
        
        c.set("uploadObj", upObj);
	if ($CL.is(upObjIndex))
	    c.set("uploadIndex", upObjIndex);
    };
    
    cl.prototype.upload = function () {
	var c = this;
	if (c.get("uploadObj")) {
	    var uploadObj = c.get("uploadObj");	    
	    
	    
	    uploadObj.IMG_LOADING = "#";
	    c.set("uploadCallback", uploadObj.callback);
	    
	    var globalPicElName = "__pic_el_" + c.get("id");
	    uploadObj.Name = globalPicElName;
	    window[globalPicElName] = c;
	    
	    uploadObj.initPicUpload();
	    
	    var $tmpDiv = $("<div />").css({
		width : c.get("width"),
		height : c.get("height"),
		background : "url(" + c.get("LOAD_IMG_SRC") + ") center no-repeat"
	    })
	    
	    c.get("$el").replaceWith($tmpDiv);
	    c.set("$el", $tmpDiv);
	    
	    uploadObj.submit();	    
	} else {
	    $CL.exception("no uploadObj connected", "Cl_Picture_Element", c);
	}
    };
    
    cl.prototype.update = function (callback) {
	var c = this;
	var upArr = {
	    name : c.get("name"),
	    type : c.get("type"),	    
	    title : c.get("title"),
	    alt : c.get("alt"),
	    tags : c.get("tags")
	};

	if (typeof callback != "function")
	    callback = function (data) {};
	
	c.get("uploadObj").onupdated = function (data) {
	    if (data.ok) {		
		callback(data);
	    } else {
		$CL.exception("could not update image", "Cl_Picture_Element", data);
	    }
	};
	
	
	c.get("uploadObj").update(c.get("id"), upArr);
    };
    
    cl.prototype.kill = function (callback) {
	var c = this;
	
	if (typeof callback != "function")
	    callback = function (data) {};
	
	c.get("uploadObj").onkilled = function (data) {
	    if (data.ok) {
		c.reset();
		callback(data);
	    } else {
                c.reset();
                callback(data);
		$CL.log("picture could no be deleted");
	    }
	};
	
	c.get("uploadObj").kill(c.get("id"));
    };
    
    cl.prototype.getAnswer = function (status, JSONpicName, error) {	
	if (status == "ok")	
	{		
		var picArr = JSON.parse(JSONpicName);
		
		var $newImg = $("<img />");
		
		this.get("$el").replaceWith($newImg);
		this.set("$el", $newImg);

		this.setFromPicArr(picArr[this.get("uploadIndex")]);

		if (this.get("uploadObj").postUrl)
		{
			$.post(this.get("uploadObj").postUrl, {
			    formValues:this.get("uploadObj").postStr,
			    picArr:JSON.stringify(picArr)
			},
			this.get("uploadCallback"),
			"json");
		}
		else
		{
			this.get("uploadCallback")(picArr);
		}
	}
	else
	{
		this.get("uploadCallback")(false, error);
	}
    }; 
    
    cl.prototype.connectWithZoom = function (zoomObj, zoomWidth, zoomHeight, zoomSrc) {
        var c = this;
        if (!$CL.is(zoomWidth)) {
            zoomWidth = c.get("$el").data("zoom-width");
            zoomHeight = c.get("$el").data("zoom-height");
            zoomSrc = c.get("$el").data("zoom-src");
        }
        
        zoomObj.setup({
            imgObj : c,
            zoomWidth : zoomWidth,
            zoomHeight : zoomHeight,
            zoomSrc : zoomSrc
        });
        
        zoomObj.init();
        
        c.set("zoomObj", zoomObj);        
    }
})(Cl_Picture_Element);