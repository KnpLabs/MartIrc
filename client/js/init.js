$(document).ready(function() {
    if (!"WebSocket" in window) {
        window.location = "error.html";
    }

    new MartIrc();

    $("#menu a").click(function() {
	$('#menu-item div').hide("normal");

	if($('#menu-item #'+$(this).attr('class')).css('display') !== 'block'){
	    $('#menu-item #'+$(this).attr('class')).show("normal");
	}
    });

    $("#menu-item input.close").click(function() {
	$('#menu-item div').hide("normal");
    });

});
