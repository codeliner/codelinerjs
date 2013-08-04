//suggestion
 (
	 function ($, cl) {
	     
		function docClick (e) {		    
		     $("#suggest_"+e.data.objId+" ul").remove();
		     $("#suggest_"+e.data.objId).css({
			  display : "none"
		     });
		};
	     
	     
		$.extend({
		    AM_suggestionSetup : {
			replace : "lastWord",
			position : "absolute",
			topPlus : 20,
			leftPlus : 0,
			zIndex : 10000,
			width : "auto",
			height : "auto",
			elementType : "input",
			filter : new Array()
		    }
		});

		$.extend({
		    AM_suggestionSetupStore : {}
		});

		$.extend({
		    AM_suggestionRemove : function (id) {
			if (typeof id == "undefined") {
			    $.each($.AM_suggestionSetupStore, function (id, obj) {
				$("#"+id).AM_suggestionClear();
				$("#suggest_"+id).remove();
			    });
			} else {
			    $("#"+id).AM_suggestionClear();
			    $("#suggest_"+id).remove();
			}
		    }
		});

		$.fn.extend({
			AM_suggestion : function (replace, options, addValueFunc) {

				var defOptions = {};
				$.extend(defOptions, $.AM_suggestionSetup);
				$.AM_suggestionSetupStore[this.attr("id")] = defOptions;
				$.AM_suggestionSetupStore[this.attr("id")].addValueFunc = $.AM_suggestionAddValue;

				if (typeof replace != "undefined" && typeof replace != "object")
				    $.AM_suggestionSetupStore[this.attr("id")].replace = replace;

				if (typeof replace == "object")
				    $.extend($.AM_suggestionSetupStore[this.attr("id")], replace);

				if (typeof options == "object")
				    $.extend($.AM_suggestionSetupStore[this.attr("id")], options);

				if (typeof $("#suggest_"+this.attr("id"))[0] == "undefined") {
				    var $suggest = $("<div />").attr({
					id : "suggest_"+this.attr("id")
				    });

				    $("body").append($suggest);
				}

				if (typeof addValueFunc == "function") {
				    $.AM_suggestionSetupStore[this.attr("id")].addValueFunc = addValueFunc;
				}


				this.bind("keyup", function (e) {
				    $.AM_suggestionGet(this.id, $.AM_suggestionElementValue($(this)), e);
				});

				this.bind("keyup", $.AM_suggestionKeys).bind("keydown", function (event) {
				     if ( event.keyCode == 13 && typeof $(".suggest_hover")[0] != "undefined" ) {
					  event.cancelBubble = true;
					  return false;
				     }

				}).bind("keypress", function (event) {
				     if ( event.keyCode == 13 && typeof $(".suggest_hover")[0] != "undefined" ) {
					  event.cancelBubble = true;
					  return false;
				     }
				});

				$(document).bind("click", {objId : this.attr("id")}, docClick);
			}
		});

		$.fn.extend({
		    AM_suggestionClear : function (doc) {
			if (typeof doc == "undefined") {
			    this.unbind("keydown");
			    this.unbind("keypress");
			    this.unbind("keyup");
			} else {
			    //unbinds alle click-Remove Functions for Suggestions passed to the document
			    //have to be called on document like this $(document).AM_suggestioClear(true);
			    this.unbind("click", docClick);
			}
		    }
		});

		$.extend({
		    AM_suggestionElementValue : function ($el, value) {

			if (typeof value != "undefined") {
			    if ($.AM_suggestionSetupStore[$el.attr("id")].elementType == "input")
				$el.attr("value", value);
			    else
				$el.html(value);
			}

			if ($.AM_suggestionSetupStore[$el.attr("id")].elementType == "input")
			    return $el.attr("value");
			else
			    return $el.html().replace(/<.*>/i, "");
		    }
		});

		$.extend({
		    AM_suggestionGet : function (from, value, e) {
			if ($CL.classExists("Cl_Admin_Console"))
			    console.set("lade Tags für die Eingabe: "+value);

			if ( typeof e == "undefined" || (e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13) ) {
			    $.post(HTTP+"/suggestion/get", {
				from:from,
				value:value,
				replace:$.AM_suggestionSetupStore[from].replace,
				filter : $.AM_suggestionSetupStore[from].filter
			    }, function (data) {				    
				    if (data != null && data.ok)
				    {
					    if (data.result)
					    {
						    
						    if ($("#"+data.from).offset() != null) {
							$("#suggest_"+data.from).css({
								position : $.AM_suggestionSetupStore[data.from].position,
								top : ($("#"+data.from).offset().top + $.AM_suggestionSetupStore[data.from].topPlus + $("#"+data.from).height()) + "px",
								left : $("#"+data.from).offset().left + $.AM_suggestionSetupStore[data.from].leftPlus + "px",
								height : $.AM_suggestionSetupStore[data.from].height,
								width : $.AM_suggestionSetupStore[data.from].width,
								zIndex : $.AM_suggestionSetupStore[data.from].zIndex,
								display : "none"
							    });
						    }
						    
						    

						    $("#suggest_"+data.from).empty().css({display:"block"});
						    
						    

						    var ul = document.createElement("ul");
						    var li = {};

						    $(ul).addClass("suggestion");
						    
						    

						    for (var i=0;i<data.result.length ;i++ )
						    {
							    li = document.createElement("li");

							    $(li).bind("click", {
								 fromID : data.from
							    }, function (e) {
								$.AM_suggestionSetupStore[e.data.fromID].addValueFunc( $("#"+e.data.fromID), this.innerHTML);
								 $("#"+e.data.fromID).focus();

								 $("#suggest_"+e.data.fromID).css({
								      display : "none"
								 })
							    }).bind("mouseover", function (e) {
								 $(this.parentNode).find("li").each(function () {
								      $(this).removeClass("suggest_hover");
								 });
								 $(this).addClass("suggest_hover");
							    }).html(data.result[i]).css({
								 cursor : "pointer"
							    });

							    $(ul).append(li);
							    li = null;
						    }						    

						    $("#suggest_"+data.from).append(ul);
					    }
					    else {
						$("#suggest_"+data.from+" ul").remove();
						$("#suggest_"+data.from).css({
						      display : "none"
						 });
					    }
				    }
				    else if (data != null && data.failure)
				    {
					    alert($CL.JSON.stringify(data));
				    }
			    }, "json");
			 }
		    }
		});

		$.extend({
		    AM_suggestionKeys : function (event) {
			 var el = event.target;
			 var id = event.target.id;
			 var suggest_ul = $("#suggest_"+id+" ul")[0];

			 if (typeof suggest_ul != "undefined") {
			      var startLi = null;
			      var liArr = $(suggest_ul).find("li");
			      var pos = -1;
			      var anzahl = 0;

			     if (typeof $(suggest_ul).find(".suggest_hover")[0] != "undefined") {
				   startLi = $(suggest_ul).find(".suggest_hover")[0];
			      }

			      liArr.each(function (i, obj) {
				   anzahl++;
				   if (obj == startLi)
					pos = i;
			      });

			      /*up Key*/
			      if (event.keyCode == 38) {
				   pos -= 1;

				   if (pos < 0)
					pos = anzahl - 1;
			      }
			      /*down Key*/
			      if (event.keyCode == 40) {
				   pos += 1;

				   if (pos >= anzahl)
					pos = 0;
			      }

			      if (event.keyCode == 13) {
				   if (typeof startLi.innerHTML != "undefined") {
					$.AM_suggestionSetupStore[$(el).attr("id")].addValueFunc($(el), $(startLi).html());
					$(suggest_ul).remove();
					$("#suggest_"+id).css({
					     display : "none"
					});
					return false;
				   }
			      }

			      $(suggest_ul).find("li").removeClass("suggest_hover");
			      $(liArr[pos]).addClass("suggest_hover");
			 }
		    }
		});

		$.extend({
		    AM_suggestionAddValue : function ($el, newVal) {

			var pos = -1;
			var value = $.AM_suggestionElementValue($el);

			switch ($.AM_suggestionSetupStore[$el.attr("id")].replace) {
			    case "all":
				value = newVal;
				break;

			    case "lastWord":
				pos = value.lastIndexOf(" ");

				if (pos > -1) {
				    value = value.substring(0, pos)+" "+newVal;
				} else {
				    value = newVal;
				}
				break;

			    default:
				pos = value.lastIndexOf($.AM_suggestionSetupStore[$el.attr("id")].replace);
				if (pos > -1) {
				    value = value.substring(0, pos+1)+newVal;
				} else {
				    value = newVal;
				}

				value = value+$.AM_suggestionSetupStore[$el.attr("id")].replace;
			}

			$.AM_suggestionElementValue($el, value);
		    }

		});
	 }
 )
 (jQuery, Cl_Jquery_Plugin_Suggestion);