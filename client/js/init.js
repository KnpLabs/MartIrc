$(document).ready(function() {
    if (!"WebSocket" in window) {
        window.location = "error.html";
    }

    new MartIrc();

    $("#userPreferencesLink[rel]").overlay();

});
