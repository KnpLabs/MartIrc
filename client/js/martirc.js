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
};

MartIrc.prototype.bindEvents = function() {
    var self = this;

    $('#connectButton').click(function() {
        self.connect();
    });

    $('#prompt form').submit(function(event) {
        event.preventDefault();

        self.parseOutgoingMessage();
    });

    $('#chat .current-title img').live('click', function(event) {
        self.removeChannel();
    });

    $('#channels a.channel').live('click', function(event) {
        self.focusOnPublicChannel($(this));
    });

    $('#channels a.user, #users .list.active a').live('click', function(event) {
        self.focusOnPrivateChannel($(this));
    });

    $('#channels a.server').live('click', function(event) {
        self.focusOnServerChannel();
    });

    $('#prompt form input').focus();
};

MartIrc.prototype.connect = function() {
    var self = this;

    if (self.ircConnection && self.ircConnection.connected()) {
        self.ircConnection.disconnect();

        self.ircConnection = null;
    }

    self.ircConnection = new IrcConnection({
        nodeServerHost: $('#nodeServerHost').val(),
        nodeServerPort: parseInt($('#nodeServerPort').val()),
        ircServerHost: $('#ircServerHost').val(),
        ircServerPort: parseInt($('#ircServerPort').val()),
        nickname: $('#nickname').val()
    });

    $(self.ircConnection).bind('irc.server', function(event, data) {
        $(self).trigger('irc.server', data);

        self.server.addMessage(data.raw);

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
	    user = self.channels[nickname];

	    if(!user){
		user = new User(nickname);
	    }

	    self.channels[channelName].addUser(user);
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
    case '353':
        users = data.params[3].split(' ');
	channelName = data.params[2];

	if(!self.channels[channelName]){
	    return;
	}

        for (i in users) {
	    if(users[i] != self.ircConnection.settings.nickname){
		user = self.channels[users[i]];

		if(!user){
		    user = new User(users[i]);
		}

		self.channels[channelName].addUser(user);
	    }
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
	var name = argument;
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
	}

	channel.focus();
        break;
    case 'k':
        self.removeChannel();
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

    self.channels[channel].focusOnPrompt();
};

MartIrc.prototype.sendMessage = function(rawMsg) {
    var self = this;

    var channel = $('#channels .active').text();

    if ($('#chat .active').hasClass('server')) {
	self.server.addCommand(rawMsg);

	if(!rawMsg){
	    return;
	}

        self.ircConnection.sendMessage(rawMsg);

	self.server.focusOnPrompt();
    } else {
	self.channels[channel].addMessage(self.ircConnection.settings.nickname, rawMsg);

        self.ircConnection.privmsg(channel, rawMsg);

	self.channels[channel].focusOnPrompt();
    }
};

MartIrc.prototype.focusOnServerChannel = function() {
    var self = this;

    self.server.focus();
};

MartIrc.prototype.focusOnPublicChannel = function(channel) {
    var self = this;

    self.channels[channel.text()].focus();
};

MartIrc.prototype.focusOnPrivateChannel = function(channel) {
    var self = this;

    var user = self.channels[channel.text()];

    if(!user){
	user = new User(channel.text());
	user.create();
	self.channels[channel.text()] = user;
    }

    user.focus();
};

MartIrc.prototype.removeChannel = function() {
    var self = this;

    if ($('#channels .active').attr('id') === 'server') {
	return;
    }

    if (self.channels[channelName] instanceof Channel) {
        self.ircConnection.part(channelName);
    }

    self.channels[channelName].destroy();
    delete self.channels[channelName];

    if(!Object.keys(self.channels).length){
	self.server.focus();

	return;
    }

    self.channels[Object.keys(self.channels).pop()].focus();
};
