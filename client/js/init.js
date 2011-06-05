$(document).ready(function() {
    if (!"WebSocket" in window) {
        window.location = "error.html";
    }

    new MartIrc();

    $("#userPreferencesLink[rel]").overlay();

    function computeChatWrapperHeight() {
        return $(window).height() - $('#header').height() - $('#prompt').height();
    };

    function computeChatAreaHeight() {
        return $('#chat').height() - $('#chat > .current-title').height();
    };

    function setHeight() {
        $('#chat-wrapper').height(computeChatWrapperHeight());

        // TODO: find a layout that permit to set the height of .chat-area in css
        $('#chat > .server, #chat > .chat-area').height(computeChatAreaHeight());
    };

    $(window).resize(function () {
        setHeight();
    });

    setHeight();

});
