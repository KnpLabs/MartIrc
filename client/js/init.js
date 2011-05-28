$(document).ready(function() {
    if (!"WebSocket" in window) {
        window.location = "error.html";
    }

    new MartIrc();

    $("#menu .prefs").click(function() {
        $("#connection-informations").toggle('slow');
    });
});
