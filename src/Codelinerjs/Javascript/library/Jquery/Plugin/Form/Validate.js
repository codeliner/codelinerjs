function Cl_Jquery_Plugin_Form_Validate () {

};

///Form Values validieren
 (
	 function ($) {
		$.fn.extend({
			/*
			 * als Option kann ein defaultValue übergeben werden,
			 * gegen den das Feld ebenfalls geprüft wird
			 * @param options.defValue
			 */
			validIsNotEmpty : function (options, callback) {
			    var check = true;

			    if (typeof options == "function") {
				callback = options;
				options = null;
			    }

			    if (options != null && typeof options.defValue != "undefined") {
				if (this.attr("value") == options.defValue)
				    check = false;
			    }

			    if (this.attr("value") == "")
				check = false;

			    callback(check);
			},
			/*
			 * als Option kann eine Mindestlänge und eine
			 * maximale Länge übergeben werden
			 * @param options.min
			 * @param options.max
			 *
			 */
			validStringLength : function (options, callback) {
			    var check = false;

			    if (typeof options != "object") {
				alert("StringLength Validator benötigt min oder max Option");
				callback(check);
				return false;
			    }

			    if (typeof options.min != "undefined") {
				if (this.attr("value").length < parseInt(options.min)) {
				    check = false;
				} else {
				    check = true;
				}
			    }

			    if (typeof options.max != "undefined") {
				if (this.attr("value").length > parseInt(options.max)) {
				    check = false;
				} else {
				    check = true;
				}
			    }

			    callback(check);
			},

			validIsPostCode : function (options, callback) {
			    var check = true;

			    if (typeof options == "function") {
				callback = options;
				options = null;
			    }

			    $.ajaxSetup({async : false});
			    $.post(HTTP+"/validation/", {
				value : this.attr("value"),
				method : "isPostCode"
			    }, callback, "json");
			    $.ajaxSetup({async : true});
			},

			validIsEMail : function (options, callback) {
			    var check = true;

			    if (typeof options == "function") {
				callback = options;
				options = null;
			    }

			    $.ajaxSetup({async : false});
			    $.post(HTTP+"/validation/", {
				value : this.attr("value"),
				method : "isEMail"
			    }, callback, "json");
			    $.ajaxSetup({async : true});
			}

		});
	 }
 )
 (jQuery);