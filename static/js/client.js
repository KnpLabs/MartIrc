$(document).ready(function() {
    if(!"WebSocket" in window) {
        window.location = "error.html";
    }

    var martIrcClient = new MartIrcClient();
});
