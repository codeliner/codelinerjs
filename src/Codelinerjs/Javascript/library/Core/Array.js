Array.prototype.toString = function (trenner) {
    var str = "";

    if (typeof(trenner) == "undefined")
    {
        trenner = ",";
    }


    for (var i=0;i<this.length;i++)
    {
        str += this[i];

        if (i<this.length-1)
        {
            str += trenner;
        }
    }

    return str;
};