/**
 * MartIrc constructor
 *
 * @contructor
 *
 */
MartIrc = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    MartIrc.server = new Server();
    MartIrc.channels = new Channels();
    MartIrc.ircConnectionSettings = null;

    MartIrc.outgoingMessage = new OutgoingMessage();
    MartIrc.incomingMessage = null;

    MartIrc.ircConnection = null;
    MartIrc.storage = new Storage();
    self.utils = new Utils();

    self.init();
    self.bindEvents();
};

/**
 * MartIrc init
 *
 */
MartIrc.prototype.init = function() {
    var self = this;

    if(MartIrc.storage.getNickname()){
        $('#nickname').val(MartIrc.storage.getNickname());
    }

    $('input[name=connectOnStartup]').prop('checked', MartIrc.storage.getConnectOnStartup());

    MartIrc.ircConnectionSettings = {
        nodeServerHost: $('#nodeServerHost').val(),
        nodeServerPort: parseInt($('#nodeServerPort').val()),
        ircServerHost: $('#ircServerHost').val(),
        ircServerPort: parseInt($('#ircServerPort').val()),
        nickname: $('#nickname').val()
    };

    if(MartIrc.storage.getConnectOnStartup()){
        OutgoingMessage.connect();
    }
};

MartIrc.prototype.bindEvents = function() {
    var self = this;

    $('#connectButton').click(function() {
        OutgoingMessage.connect();
    });

    $('#connectOnStartup').click(function(event) {
        MartIrc.storage.setConnectOnStartup($('input[name=connectOnStartup]').is(':checked'));
    });

    $('#nickname').change(function(event) {
        MartIrc.storage.setNickname($('#nickname').val());
    });

    $('#prompt form').submit(function(event) {
        event.preventDefault();

        var arguments = MartIrc.outgoingMessage.parseArguments($('#prompt form input').val());

        $('#prompt form input').val('');

        if(arguments) {
            MartIrc.outgoingMessage.processArguments(arguments);
        }
    });

    $('#channels a.server').live('click', function(event) {
        var serverWidget = new ServerWidget(MartIrc.server);
        serverWidget.focus();
    });

    $('#prompt form input').focus();
};
