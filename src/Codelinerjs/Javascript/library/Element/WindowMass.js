var Element = $CL.namespace('Cl.Element');

Element.WindowMass = function () {
    var height = 0;
    var width = 0;

    var $checkDiv = $("<div />").css({
        position: "absolute",
        top : "-1px",
        left : "0px",
        height : "1px",
        width : "100%"
    }).attr({id : "fenster_checkDiv"});

    $("body").append($checkDiv);

    width = $("#fenster_checkDiv").width();
    height = $(window).height();


    $("#fenster_checkDiv").remove();

    return {"height":height,"width":width};
};