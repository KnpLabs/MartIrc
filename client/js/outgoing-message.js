OutgoingMessage = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.utils = new Utils();

    self.bindEvents();
};

OutgoingMessage.prototype.bindEvents = function() {
    var self = this;

    $('#chat .current-info img').live('click', function(event) {
        self.removeChannel(null);
    });

    $('#channels a.user, #channels a.channel, #users .list.active a').live('click', function(event) {
        self.createChannel($(this).text());
    });

    $('#nickname').change(function(event) {
        self.changeNickname($('#nickname').val());
    });
};

OutgoingMessage.prototype.parseArgs = function() {
    var self = this;

    var extractCommand = new RegExp("^:(\\w)(?: ([\\S]+))*", "");

    var rawMsg = $('#prompt form input').val();

    $('#prompt form input').val('');

    var matches = rawMsg.match(extractCommand);

    if (!matches) {
        self.sendMessage(rawMsg);

        return null;
    }

    return matches;
};

OutgoingMessage.prototype.processArgs = function() {
    var self = this;

    if(!MartIrc.ircConnection) {
        return null;
    }

    var matches = self.parseArgs();

    var command = matches[1];
    var argument = matches[2];

    switch (command) {
    case 'c':
        self.connect();
        break;
    case 'j':
        self.createChannel(argument);
        break;
    case 'k':
        self.removeChannel(argument);
        break;
    case 'n':
        self.changeNickname(argument);
        break;
    case 's':
        MartIrc.server.focus();
        break;
    }
};


OutgoingMessage.prototype.sendMessage = function(rawMsg) {
    var self = this;

    var channel = $('#channels .active').text();

    if (MartIrc.server.isActive()) {
        MartIrc.server.addCommand(rawMsg);

        if(!rawMsg){
            return;
        }

        MartIrc.ircConnection.sendMessage(rawMsg);

        MartIrc.server.scrollAtTheEnd();
        MartIrc.server.focusOnPrompt();
    } else {
        MartIrc.channels[channel].addMessage(MartIrc.ircConnection.settings.nickname, rawMsg);

        MartIrc.ircConnection.privmsg(channel, rawMsg);

        MartIrc.channels[channel].scrollAtTheEnd();
        MartIrc.channels[channel].focusOnPrompt();
    }
};

OutgoingMessage.prototype.createChannel = function(name) {
    var self = this;

    var channel = MartIrc.channels[name];

    if(!channel){

        if (name[0] === '#') {
            MartIrc.ircConnection.join(name);

            channel = new Channel(name);
        }
        else
        {
            channel = new User(name);
        }

        channel.create();

        MartIrc.channels[name] = channel;
        MartIrc.storage.addChannel(name, MartIrc.ircConnection.settings.ircServerHost);
    }

    channel.focus();
};

OutgoingMessage.prototype.removeChannel = function(name) {
    var self = this;

    var channelName = name ? name : $('#channels .active').text();

    if(!(channelName in MartIrc.channels) || MartIrc.server.isActive()){
        return;
    }

    if (MartIrc.channels[channelName] instanceof Channel) {
        MartIrc.ircConnection.part(channelName);
    }

    MartIrc.channels[channelName].destroy();
    MartIrc.storage.removeChannel(channelName,MartIrc.ircConnection.settings.ircServerHost);
    delete MartIrc.channels[channelName];

    if(!Object.keys(MartIrc.channels).length){
        MartIrc.server.focus();

        return;
    }

    MartIrc.channels[Object.keys(MartIrc.channels).pop()].focus();
};

OutgoingMessage.prototype.changeNickname = function(nickname) {
    var self = this;

    if (!MartIrc.ircConnection || !MartIrc.ircConnection.connected()) {
        return;
    }

    MartIrc.ircConnection.nick(nickname);
    MartIrc.ircConnection.settings.nickname = nickname;
};
