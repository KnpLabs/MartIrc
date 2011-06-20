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

    self.server = new Server();
    self.channels = new Array();

    self.ircConnection = null;
    self.storage = new Storage();
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

    if(self.storage.getNickname()){
        $('#nickname').val(self.storage.getNickname());
    }

    $('input[name=connectOnStartup]').prop('checked', self.storage.getConnectOnStartup());

    if(self.storage.getConnectOnStartup()){
        self.connect();
    }
};

MartIrc.prototype.bindEvents = function() {
    var self = this;

    $('#connectButton').click(function() {
        self.connect();
    });

    $('#connectOnStartup').click(function(event) {
        self.storage.setConnectOnStartup($('input[name=connectOnStartup]').is(':checked'));
    });

    $('#nickname').change(function(event) {
        self.storage.setNickname($('#nickname').val());

        self.changeNickname($('#nickname').val());
    });

    $('#prompt form').submit(function(event) {
        event.preventDefault();

        self.parseOutgoingMessage();
    });

    $('#chat .current-info img').live('click', function(event) {
        self.removeChannel(null);
    });

    $('#channels a.user, #channels a.channel, #users .list.active a').live('click', function(event) {
        self.createChannel($(this).text());
    });

    $('#channels a.server').live('click', function(event) {
        self.server.focus();
    });

    $('#prompt form input').focus();
};

MartIrc.prototype.connect = function() {
    var self = this;

    if (self.ircConnection && self.ircConnection.connected()) {
        self.ircConnection.disconnect();

        for(name in self.channels){
            self.channels[name].destroy();
        }

        self.channels = new Array();

        self.ircConnection = null;
    }

    self.ircConnection = new IrcConnection({
        nodeServerHost: $('#nodeServerHost').val(),
        nodeServerPort: parseInt($('#nodeServerPort').val()),
        ircServerHost: $('#ircServerHost').val(),
        ircServerPort: parseInt($('#ircServerPort').val()),
        nickname: $('#nickname').val()
    });

    // set the name of the server in the title bar
    self.server.name = self.ircConnection.settings.ircServerHost;
    self.server.focus();

    $(self.ircConnection).bind('irc.server', function(event, data) {
        $(self).trigger('irc.server', data);

        self.server.addMessage(data.raw);

        self.server.scrollAtTheEnd();

        self.parseIncomingMessage(data);
    });

};

MartIrc.prototype.scanMessage = function(rawMsg) {
    var self = this;

    var msg = self.utils.escape(rawMsg);

    var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

    return msg.replace(regex, " <a href=\"$&\" target=\"_blank\">$&</a> ");
};

MartIrc.prototype.parseIncomingMessage = function(data) {
    var self = this;

    var channelName = null;
    var rawMsg = null;
    var nickname= null;
    var users = null;
    var user = null;

    switch (data.command) {
    case 'privmsg':
        channelName = data.params[0];
        nickname = data.person.nick;
        rawMsg = data.params[1];

        self.receiveMessage(channelName, nickname, rawMsg);
        break;
    case 'join':
        channelName = data.params[0];
        nickname = data.person.nick;

        if(nickname != self.ircConnection.settings.nickname){
            self.channels[channelName].addUser(new User(nickname));
        }
        break;
    case 'part':
        channelName = data.params[0];
        nickname = data.person.nick;

        if(!self.channels[channelName]){
            return;
        }

        self.channels[channelName].removeUser(nickname);
        break;
    case 'nick':
        var oldNickname = data.person.nick;
        var newNickname = data.params[0];

        for(name in self.channels){

            if(self.channels[name] instanceof Channel){
                if(self.channels[name].hasUser(oldNickname)){
                    self.channels[name].renameUser(oldNickname, newNickname);
                }
            } else {

                if(name == oldNickname){
                    self.channels[newNickname] = self.channels[oldNickname];
                    self.channels[newNickname].rename(newNickname);

                    delete self.channels[oldNickname];
                }
            }
        }

        break;
    case '332':
	channelName = data.params[1];
	var topic = data.params[2];

	self.channels[channelName].topic = topic;

	if(self.channels[channelName].isActive()){
	    self.channels[channelName].focus();
	}

	break;
    case '353':
        users = data.params[3].split(' ');
        channelName = data.params[2];

        if(!self.channels[channelName]){
            return;
        }

        for (i in users) {
            if(users[i] != self.ircConnection.settings.nickname){
                self.channels[channelName].addUser(new User(users[i]));
            }
        }
        break;
    case '376':
        self.channels = self.storage.getChannels(self.ircConnection.settings.ircServerHost);

        if(!Object.keys(self.channels).length){
            return;
        }

        for(name in self.channels){
            if(self.channels[name] instanceof Channel){
                self.ircConnection.join(name);
            }

            self.channels[name].create();
	    self.channels[name].focus();
        }

        break;
    }
};

MartIrc.prototype.parseOutgoingMessage = function() {
    var self = this;

    var extractCommand = new RegExp("^:(\\w)(?: ([\\S]+))*", "");

    var rawMsg = $('#prompt form input').val();

    $('#prompt form input').val('');

    var matches = rawMsg.match(extractCommand);

    if (!matches) {
        self.sendMessage(rawMsg);

        return;
    }

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
        self.server.focus();
        break;
    }
};

MartIrc.prototype.receiveMessage = function(channel, nickname, rawMsg) {
    var self = this;

    if(channel === self.ircConnection.settings.nickname){
        channel = nickname;
    }

    if (!self.channels[channel]) {
        var user = new User(channel);
        user.create();
        self.channels[channel] = user;
    }

    self.channels[channel].addMessage(nickname, self.scanMessage(rawMsg));

    self.channels[channel].scrollAtTheEnd();
};

MartIrc.prototype.sendMessage = function(rawMsg) {
    var self = this;

    var channel = $('#channels .active').text();

    if (self.server.isActive()) {
        self.server.addCommand(rawMsg);

        if(!rawMsg){
            return;
        }

        self.ircConnection.sendMessage(rawMsg);

        self.server.scrollAtTheEnd();
        self.server.focusOnPrompt();
    } else {
        self.channels[channel].addMessage(self.ircConnection.settings.nickname, rawMsg);

        self.ircConnection.privmsg(channel, rawMsg);

        self.channels[channel].scrollAtTheEnd();
        self.channels[channel].focusOnPrompt();
    }
};

MartIrc.prototype.createChannel = function(name) {
    var self = this;

    var channel = self.channels[name];

    if(!channel){

        if (name[0] === '#') {
            self.ircConnection.join(name);

            channel = new Channel(name);
        }
        else
        {
            channel = new User(name);
        }

        channel.create();

        self.channels[name] = channel;
        self.storage.addChannel(name, self.ircConnection.settings.ircServerHost);
    }

    channel.focus();
};

MartIrc.prototype.removeChannel = function(name) {
    var self = this;

    var channelName = name ? name : $('#channels .active').text();

    if(!(channelName in self.channels) || self.server.isActive()){
        return;
    }

    if (self.channels[channelName] instanceof Channel) {
        self.ircConnection.part(channelName);
    }

    self.channels[channelName].destroy();
    self.storage.removeChannel(channelName,self.ircConnection.settings.ircServerHost);
    delete self.channels[channelName];

    if(!Object.keys(self.channels).length){
        self.server.focus();

        return;
    }

    self.channels[Object.keys(self.channels).pop()].focus();
};

MartIrc.prototype.changeNickname = function(nickname){
    var self = this;

    if (!self.ircConnection || !self.ircConnection.connected()) {
        return;
    }

    self.ircConnection.nick(nickname);
    self.ircConnection.settings.nickname = nickname;
};
