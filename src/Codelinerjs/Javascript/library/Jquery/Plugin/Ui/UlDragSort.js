$CL.require("Cl_Jquery_Plugin_Ui_Sortable");
$CL.require("Cl_Effect_Opacity_Black");

/***************************************/
  /*
   * ulDrag - verschiebbare Listenelemente über mehrere ebenen
   * mit Hilfe von jqueryUI sortable
   * gespeichert wird per ajax, indem auf die link ids der li's zugegriffen wird
   *
   * post-Link kommt von URL.menueUpdate
   *
   * @uses Cl_Jquery_Plugin_Ui_Sortable, Cl_Effect_Opacity_Black
   */
function Cl_Jquery_Plugin_Ui_UlDragSort () {
    this.$li;
    this.$lastUl;
    
    this.mode = false;
    this.mp = "";
    this.toMp = "";
    this.afterIntoMode = false;
    this.afterIntoToID = false;
};

(function (cl) {
    
    cl.prototype.reset = function () {
        this.$li = null;
        this.$lastUl = null;
        this.mode = false;
        this.mp = "";
        this.toMp = false;
        this.afterIntoMode = false;
        this.afterIntoToID = false;
    };
    
    cl.prototype.checkPos = function () {
        var c = this;
        var $prev = c.$li.prev();

        //testen ob es ein previousNode gibt
        if ($prev.length != 0) {
            if ($prev.hasClass("newLi")) {
                $prev.before(c.$li);	
                c.checkPos();
                return;
            }

            c.toMp = $prev.find("a:first").attr("id").replace("menu-", "");            
            c.mode = "after";
        }
        else {
            var $next = c.$li.next();

            if ($next.length != 0 && !$next.hasClass("newLi")) {
                c.toMp = $next.find("a:first").attr("id").replace("menu-", "");
                c.mode = "before";
            }
        }
        
        var $activeUl = c.$li.parent("ul");
        
        if ($activeUl.length > 0) {
            if (c.$lastUl[0] != $activeUl[0]) {
                c.afterIntoMode = c.mode;
                c.afterIntoToID = c.toMp;
                c.mode = "into";
                if ($activeUl.parent("li").length > 0)
                    c.toMp = $activeUl.parent("li").find("a:first").attr("id").replace("menu-", "");
                else
                    c.toMp = "container";
            }
        }
    }
    
    cl.prototype.save = function () {
        var c = this;
        c.mp = c.$li.find("a:first").attr("id").replace("menu-", "");
       
        c.checkPos();

        $WS.effects.bOp.on();
       
        $.post(URL.menueUpdate, {
            id : c.mp,
            toId : c.toMp,
            mode : c.mode,
            afterIntoMode : c.afterIntoMode,
            afterIntoToID : c.afterIntoToID
        }, function (data) {
            if (data.ok)
            {
                c.reset();
                $WS.effects.bOp.off();
            }
            else if (data.failure)
            {
                $CL.exception("die Änderungen am Menüpunkt wurden nicht gespeichert", "Cl_Jquery_Plugin_Ui_UlDragSort", data.failure);
            }
        }, "json");
    };
    
    cl.prototype.setActiveLi = function ($li) {
        this.reset();
        this.$li = $li;
        this.$lastUl = $li.parent("ul");        
    };
    
})(Cl_Jquery_Plugin_Ui_UlDragSort);

(function ($) {
	$.fn.extend({
		ulDrag : function (UL_CON_SEL) {
                    
                    var ulDragObj = new Cl_Jquery_Plugin_Ui_UlDragSort();
		    
		    $(this).find("li").each(function (i, obj) {

			var mpName = $(this).find("a:first").attr("id");
			mpName = mpName.replace("menu-", "");

			$(this).bind("contextmenu", function (e) {
			    $WS.menu.infoPage(e, $(this).find("a:first").attr("id").replace("menu-", ""));
			    return false;
			});

			var $add = $("<a />").attr({
			    href : "#"
			})
			.html("+")
			.css({
			    marginLeft : "10px"

			})
			.bind("click", function (e) {
			    $WS.menu.addPage(e, this.parentNode);
			    return false;
			})
			.bind("mouseover", function () {
			    Tip("Menüpunkt hinzufügen");
			});

			var $remove = $("<a />").attr({
			    href : "#"
			})
			.html("x")
			.css({
			    marginLeft : "10px",
			    color : "#ddd"

			})
			.bind("click", function (e) {
			    $WS.menu.removePage(e, this.parentNode);
			    return false;
			})
			.bind("mouseover", function () {
			    $(this).css("color", "#c00");
			    Tip("Menüpunkt löschen");
			}).bind("mouseout", function () {
			    $(this).css("color", "#ddd");
			});

			$(this).find("a:first").after($remove);

			var $newLi = $("<li />").append($add).addClass("newLi");

			var $newUl = $("<ul />").attr({
			    id : "ul_"+mpName
			})
			.append($newLi);

			$(this).append($newUl);
		    });


		    var $add = $("<a />").attr({
			href : "#"
		    })
		    .html("+")
		    .css({
			marginLeft : "10px"

		    })
		    .bind("click", function (e) {
			$WS.menu.addPage(e, this.parentNode);
			return false;
		    })
		    .bind("mouseover", function () {
			Tip("Menüpunkt hinzufügen");
		    });

		    var $newLi = $("<li />").append($add).addClass("newLi");

		    $(this).append($newLi);
		    
		    $(UL_CON_SEL + " ul").sortable({
			revert: true,
			cancel : ".newLi",
			start : function (e, ui) {
                            ulDragObj.setActiveLi(ui.helper);
			},
			stop : function () {
			    ulDragObj.save();
			},
			connectWith : UL_CON_SEL + " ul"
		    });

		    return $(this);
		}
	});
}
)(jQuery);