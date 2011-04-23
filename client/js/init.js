$(document).ready(function() {
    if (!"WebSocket" in window) {
        window.location = "error.html";
    }

    new MartIrcUi();

    $("#menu .prefs").click(function() {
        $("#connection-informations").toggle('slow');
    });
});
