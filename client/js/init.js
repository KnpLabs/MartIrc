$(document).ready(function() {
    if (!"WebSocket" in window) {
        window.location = "error.html";
    }

    new MartIrc();

    $("#userPreferencesLink[rel]").overlay();

    /*
    * Computes the height of main chat area (chat + channels + users)
    * dynamically. This is useful to have the prompt always visible in the
    * window.
    */
    function martIrcSetChatHeight() {
        $('#chat-wrapper').height($(window).height() - $('#header').height() - $('#prompt').height());
    };

    $(window).resize(function () {
        martIrcSetChatHeight();
    });

    martIrcSetChatHeight();
});
