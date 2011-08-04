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
        MartIrc.ircConnection.settings.nickname = $('#nickname').val();

        self.changeNickname($('#nickname').val());
    });
};

OutgoingMessage.prototype.parseArguments = function(rawMsg) {
    var self = this;

    var extractCommand = new RegExp("^:(\\w)(?: ([\\S]+))*", "");

    var matches = rawMsg.match(extractCommand);

    if (!matches) {
        self.sendMessage(rawMsg);

        return null;
    }

    return matches;
};

OutgoingMessage.prototype.processArguments = function(arguments) {
    var self = this;

    var command = arguments[1];
    var params = arguments[2];

    if(command === 'c') {
        self.connect();

        return;
    }

    if(!MartIrc.ircConnection) {
        return;
    }

    switch (command) {
    case 'd':
        self.disconnect();
        break;
    case 'j':
        self.createChannel(params);
        break;
    case 'k':
        self.removeChannel(params);
        break;
    case 'n':
        self.changeNickname(params);
        break;
    case 's':
        self.switchToServer();
        break;
    }
};

OutgoingMessage.prototype.connect = function()
{
    var self = this;

    self.disconnect();

    MartIrc.ircConnection = new IrcConnection(MartIrc.ircConnectionSettings);
    MartIrc.server.name = MartIrc.ircConnection.settings.ircServerHost;

    $(MartIrc.ircConnection).bind('irc.server', function(event, data) {
        $(self).trigger('irc.server', data);

        serverWidget.addMessage(data.raw);
        serverWidget.scrollAtTheEnd();

        MartIrc.incomingMessage = new IncomingMessage();
        MartIrc.incomingMessage.parse(data);
    });

    var serverWidget = new ServerWidget(MartIrc.server);
    serverWidget.focus();
};

OutgoingMessage.prototype.disconnect = function()
{
    var self = this;

    if (!MartIrc.ircConnection || !MartIrc.ircConnection.connected()) {
        return;
    }

    MartIrc.ircConnection.disconnect();

    for(name in MartIrc.channels.get()){
        var channel = MartIrc.channels.getElement(name);

        var channelWidget = channel instanceof Channel ? new ChannelWidget(channel) : new UserWidget(channel);
        channelWidget.destroy();
    }

    MartIrc.channels = new Channels();
    MartIrc.ircConnection = null;

    var serverWidget = new ServerWidget(MartIrc.server);
    serverWidget.focus();
};

OutgoingMessage.prototype.sendMessage = function(rawMsg) {
    var self = this;

    var channel = MartIrc.channels.getActiveChannel();

    if (!channel) {
        var serverWidget = new ServerWidget(MartIrc.server);
        serverWidget.addCommand(rawMsg);

        if(!rawMsg){
            return;
        }

        MartIrc.ircConnection.sendMessage(rawMsg);

        serverWidget.scrollAtTheEnd();
        serverWidget.focusOnPrompt();
    } else {

        var channelWidget = null;

        if(channel instanceof Channel) {
            channelWidget = new ChannelWidget(channel);

            MartIrc.ircConnection.privmsg(channel.name, rawMsg);
        } else {
            channelWidget = new UserWidget(channel);

            MartIrc.ircConnection.privmsg(channel.nickname, rawMsg);
        }


        channelWidget.addMessage(MartIrc.ircConnection.settings.nickname, rawMsg);
        channelWidget.scrollAtTheEnd();
        channelWidget.focusOnPrompt();
    }
};

OutgoingMessage.prototype.createChannel = function(channelName) {
    var self = this;

    var channel = MartIrc.channels.getElement(channelName);

    if(!channel) {

        if (channelName[0] === '#') {
            MartIrc.ircConnection.join(channelName);

            channel = new Channel(channelName);
        } else {
            channel = new User(channelName);
        }

        MartIrc.channels.setElement(channelName, channel);
        MartIrc.storage.addChannel(channelName, MartIrc.ircConnection.settings.ircServerHost);
    }

    MartIrc.channels.setActiveChannel(channelName);

    var channelWidget = channel instanceof Channel ? new ChannelWidget(channel) : new UserWidget(channel);

    if(!channelWidget.isCreated()) {
        channelWidget.create();
    }

    channelWidget.focus();
};

OutgoingMessage.prototype.removeChannel = function(channelName) {
    var self = this;

    var channel = channelName ? MartIrc.channels.getElement(channelName) : MartIrc.channels.getActiveChannel();

    if(!channel) {
        return;
    }

    if(channel instanceof Channel) {
        channelName = channel.name;

        MartIrc.ircConnection.part(channelName);
    } else {
        channelName = channel.nickname;
    }

    var channelWidget = channel instanceof Channel ? new ChannelWidget(channel) : new UserWidget(channel);
    channelWidget.destroy();

    MartIrc.storage.removeChannel(channelName, MartIrc.ircConnection.settings.ircServerHost);

    MartIrc.channels.removeElement(channelName);

    if(!MartIrc.channels.countElement()) {
        var serverWidget = new ServerWidget(MartIrc.server);
        serverWidget.focus();

        return;
    }

    channel = MartIrc.channels.getLastElement();

    channelName = channel instanceof Channel ? channel.name : channel.nickname;

    MartIrc.channels.setActiveChannel(channelName);

    channelWidget = channel instanceof Channel ? new ChannelWidget(channel) : new UserWidget(channel);

    channelWidget.focus();
};

OutgoingMessage.prototype.changeNickname = function(nickname) {
    var self = this;

    if (!MartIrc.ircConnection || !MartIrc.ircConnection.connected()) {
        return;
    }

    MartIrc.ircConnection.nick(nickname);
    MartIrc.ircConnection.settings.nickname = nickname;
};

OutgoingMessage.prototype.switchToServer = function() {
    var self = this;

    MartIrc.channels.setActiveChannel(null);

    var serverWidget = new ServerWidget(MartIrc.server);
    serverWidget.focus();
};