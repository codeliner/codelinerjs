$CL.require("Cl_Jquery_Plugin_Form_Values");
$CL.require("Cl_Picture_Element");
/*
 *  Pic Upload 
 */
function Cl_Picture_Upload () {

	this.UPLOAD_URL = "/picture/upload/ajax/true";
	this.UPDATE_URL = "/picture/update";
	this.RM_URL = "/picture/kill";

	this.IMG_LOADING = null;

	this.Name = "";  //name des PicUpload Objects, wird benötigt, damit upload-script die .getAnswer Funktion des Objects aufrufen kann
	this.formID = ""; //id des Formulars, in dem das Ziel-img sowie das input:type=file liegen
	this.containerID = ""; //optional, die id eines Elements, dass relevante pics und inputs einer Form umschließt, damit nicht alle pics erfasst werden
	this.form = {}; //die form wird als Object initialisiert, und sämtliche Inputs werden ausgelesen
	this.imges = {}; //alle Bilder werden in einem Object zusammen gefasst
	this.fileInputs = {}; //alle file-inputs werden in einem Object zusammen gefasst
	this.targetSrc = ""; //der Pfad, in dem das Image gespeichert wird
	this.postStr = false; //optional um nach Bildupload die Form abzusenden
	this.postUrl = false; //optional um nach Bildupload ein ajax-Script aufzurufen
	//optional callback-function die nach ajax-reqeust aufgerufen werden soll
	this.callback = function (picArr, error) {
		if (picArr)
		{
		    void(0);
		}
		else if (error)
		{
			alert(error);
		}
	};

	//Event-Funktion die nach erfolgreicher Ausführung der zugehörigen
	//Hauptfunktionen ausgeführt werden, diese können mit angepassten
	//Funktionen überschrieben werden
	this.onupdated = function (data) {
	    if (typeof data != "undefined" && data.failure)
	    {
		alert(data.error);
	    } else
		return true;
	};

	this.onkilled = function (data) {
	    if (!data.ok) {
                alert(data.msg);
            }
	};

	//hilfsvariablen die die orginalangaben der Form speichern
	this.orgAction = "";
	this.orgTarget = "";
	this.orgOnSubmit = null;
	this.orgEnctype = "";
	this.orgMethod = "";
	this.orgJQEvents = new Array();
};

(function (cl) {
    cl.prototype.setOptions = function (objName, formID, targetSrc, callback, containerID, postUrl) {
	    this.Name = objName;
	    this.formID = formID;
	    this.targetSrc = targetSrc;

	    if (typeof(containerID) != "undefined")
	    {
		    this.containerID = containerID;
	    }
	    else
		    this.containerID = formID;

	    if (typeof(postUrl) != "undefined")
	    {
		    this.postUrl = postUrl;
	    }

	    if (typeof(callback) == "function")
	    {
		    this.callback = callback;
	    }
    };
    
    cl.prototype._getJQuerySubmits = function () {
        var c = this;
        if (typeof $("#"+this.formID).data("events") == "object") {
            var events = $("#"+this.formID).data("events");
            
            if ($CL.has(events, "submit") && $CL.is(events.submit.length)) {
                $.each(events.submit, function (index, submitObj) {
                    c.orgJQEvents[c.orgJQEvents.length] = {
                        data : submitObj.data,
                        handler : submitObj.handler
                    }
                });
            }
        }
    }
    
    cl.prototype._setJQuerySubmits = function () {
        var c = this;
        
        $.each(c.orgJQEvents, function (index, submitObj) {
            $(c.form).bind("submit", submitObj.data, submitObj.handler);
        }); 
    }

    cl.prototype.initPicUpload = function () {	
	
	this.orgForm = $("#" + this.formID).clone(true);
	
	this.imges = $("#"+this.containerID+" img");
	this.fileInputs = $("#"+this.containerID+" [type=file]").each(function (index) {
		$(this).attr({name:"picUploadFile_"+index});
	});
 
	this.orgAction = $("#"+this.formID)[0].action;

	if (typeof $("#"+this.formID)[0].target != "undefined")
	{
		this.orgTarget = $("#"+this.formID)[0].target;
	}

	this.orgOnSubmit = $("#"+this.formID)[0].onsubmit;
        
        this._getJQuerySubmits();
        
	this.orgEnctype = $("#"+this.formID)[0].enctype;
	this.orgMethod = $("#"+this.formID)[0].method;


	this.form = $("#"+this.formID).attr({
	    action:this.UPLOAD_URL,
	    method:"post",
	    enctype:"multipart/form-data",
	    target:"picUploadIframe"
	}).unbind("submit")[0];

	this.form.onsubmit = null;

	$(this.form).bind("submit", {obj:this}, function (event) {		    
		event.data.obj.submit();
		return false;
	});

	if (typeof $("[name=picUploadIframe]")[0] == "undefined")
	{
		$(this.form).append($("<input />").attr({
		    name:"iTargetSrc",
		    value:this.targetSrc,
		    type:"hidden"
		}));
	}


	if (typeof $("[name=picUploadIframe]")[0] == "undefined")
	{
		$(this.form).append($("<input />").attr({
		    name:"iObjName",
		    value:this.Name,
		    type:"hidden"
		}));
	}

	if (typeof $("[name=picUploadIframe]")[0] == "undefined")
	{
		$("body").append($("<iframe />").attr({
		    name:"picUploadIframe"
		}).css({
		    width:"300px",
		    height:"300px",
		    display:"none"
		}));
	}
    };

    cl.prototype.submit = function () {
	    if (typeof this.imges.length != "undefined") {
		 for (var i=0;i<this.imges.length ;i++ )
		 {			 
			 this.imges[i].src = this.IMG_LOADING;			 
		 }
	    }

	    this.postStr = $(this.form).getFormValues().jsonStr;		
	    this.form.submit();

	    $(this.form).unbind("submit");
	    
	    this._setJQuerySubmits();

	    this.form.action = this.orgAction;

	    if (this.orgTarget != "")
	    {
		    this.form.target = this.orgTarget;
	    }
	    else
		 this.form.target = null;

	    this.form.enctype = this.orgEnctype;
	    this.form.method = this.orgMethod;
            
            this.fileInputs.each(function (index, input) {
               input.value = ""; 
            });
	    
    };

    cl.prototype.getAnswer = function (status, JSONpicName, error) {
	    if (status == "ok")
	    {
		    var picArr = JSON.parse(JSONpicName);

		    var picUpObj = this;

		    $.each(picArr, function (index) {
			    if (typeof picUpObj.imges[index] != "undefined") {
			       picUpObj.imges[index].src = picArr[index]["src"];
			       
			       picArr[index]["element"] = $CL.newInstance("Cl_Picture_Element", {
				   $el : $(picUpObj.imges[index]),
				   picID : picArr[index]["ID"],
				   name : picArr[index]["name"],
				   src : picArr[index]["src"],
				   width : picArr[index]["width"],
				   height : picArr[index]["height"],
				   type : picUpObj.targetSrc,
				   title : "",
				   alt : "",
				   tags : "",
				   index : index,
				   uploadObj : picUpObj
			       });
			   }
		    });

		    if (this.postUrl)
		    {
			    $.post(this.postUrl, {
				formValues:this.postStr,
				picArr:JSON.stringify(picArr)
			    },
			    this.callback,
			    "json");
		    }
		    else
		    {
			    this.callback(picArr);
		    }
	    }
	    else
	    {
		    this.callback(false, error);
	    }
    };
    
    cl.prototype.update = function (picID, updateObj)
    {	
	    $.post(this.UPDATE_URL,
	    {picID:picID, updateArr:JSON.stringify(updateObj)},
	    this.onupdated,
	    "json");
    };

    cl.prototype.kill = function (picID) {
	$.post(this.RM_URL, {picID : picID},
	this.onkilled, "json");
    };
    
})(Cl_Picture_Upload);