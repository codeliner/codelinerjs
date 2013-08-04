 String.prototype.reverse = function () {
	return this.split("").reverse().join("");
 };

 String.prototype.trim = function (trimChars) {
     if (typeof trimChars != "string")
	 trimChars = " ";
     else {
	 trimChars = trimChars.replace("\\", "\\\\");
	 trimChars = trimChars.replace(".", "\\.");
     }

     var regPatFront = new RegExp("^("+trimChars+"){1,}");
     var regPatEnd = new RegExp("("+trimChars+"){1,}$")
     return this.replace(regPatFront, "").replace(regPatEnd, "");
 };


 String.prototype.toArray = function (trenner) {
     var str = this;
     var arr = new Array();
	var pos = 0;
	var i=0;

	if (typeof(trenner) == "undefined")
	{
	    trenner = ",";
	}


	str = this.trim(trenner);

	while (str.indexOf(trenner) > -1)
	{
		pos = str.indexOf(trenner);
		arr[i] = str.substring(0, pos);
		str = str.substring(pos+trenner.length);
		i++;
	}

	arr[i] = str;

	return arr;
 };

 String.prototype.ucfirst = function () {
     var f = this.charAt(0).toUpperCase();
     return f + this.substr(1);
 };

 String.prototype.toElementID = function () {
     return this.replace(/[^a-zA-Z0-9-_]/g, "_");
 };

 String.prototype.nl2br = function(is_xhtml) {
     var breakTag = (is_xhtml || !$CL.isDefined(is_xhtml))? '<br />' : '<br>';
     return this.replace(/([^>\r\n]*)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
 }