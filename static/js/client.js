$(document).ready(function() {
    if(!"WebSocket" in window) {
        window.location = "error.html";
    }

    var martIrcClient = new MartIrcClient();
    var martIrcUi = new MartIrcUi({ircClient: martIrcClient});
});
