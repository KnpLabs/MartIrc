IncomingMessage = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.utils = new Utils();
};

IncomingMessage.prototype.parse = function(data) {
    var self = this;

    switch (data.command) {
    case 'privmsg':
        self.receiveMessage(data.params[0], data.person.nick, data.params[1]);
        break;
    case 'join':
        self.addUserToChannel(data.person.nick, data.params[0]);
        break;
    case 'part':
        self.removeUserFromChannel(data.person.nick, data.params[0]);
        break;
    case 'nick':
        self.changeNickname(data.person.nick, data.params[0]);
        break;
    case '332':
        self.setChannelTopic(data.params[2], data.params[1]);
        break;
    case '353':
        self.addUsersToChannel(data.params[3].split(' '), data.params[2]);
        break;
    case '366':
        self.populateChannelUsers(data.params[1]);
        break;
    case '376':
        self.restoreChannels();
        break;
    }
};

IncomingMessage.prototype.receiveMessage = function(channelName, nickname, rawMsg) {
    var self = this;

    if(channelName === MartIrc.ircConnection.settings.nickname){
        channelName = nickname;
    }

    if(!MartIrc.channels.hasElement(channelName)) {

        if(channelName[0] === '#') {
            MartIrc.channels.setElement(channelName, new Channel(channelName));
        } else {
            MartIrc.channels.setElement(channelName, new User(channelName));
        }
    }

    var channelWidget = MartIrc.channels.getElement(channelName) instanceof Channel ? new ChannelWidget(MartIrc.channels.getElement(channelName)) : new UserWidget(MartIrc.channels.getElement(channelName));

    if(!channelWidget.isCreated()) {
        channelWidget.create();
    }

    channelWidget.addMessage(nickname, self.scanMessage(rawMsg));
    channelWidget.scrollAtTheEnd();
};

IncomingMessage.prototype.changeNickname = function(oldNickname, newNickname) {
    var self = this;

    var widget = null;

    for(name in MartIrc.channels.get()){

        if(MartIrc.channels.getElement(name) instanceof Channel){
            if(MartIrc.channels.getElement(name).hasUser(oldNickname)){
                MartIrc.channels.getElement(name).renameUser(oldNickname, newNickname);

                widget = new ChannelWidget(MartIrc.channels.getElement(name));
                widget.renameUser(oldNickname, newNickname);
            }
        } else {

            if(name == oldNickname){
                MartIrc.channels.setElement(newNickname, MartIrc.channels.getElement(oldNickname));
                MartIrc.channels.getElement(newNickname).rename(newNickname);
                MartIrc.channels.removeElement(oldNickname);

                widget = new UserWidget(MartIrc.channels.getElement(newNickname));
                widget.rename(oldNickname);
            }
        }
    }
};

IncomingMessage.prototype.addUserToChannel = function(nickname, channelName) {
    var self = this;

    if(nickname != MartIrc.ircConnection.settings.nickname){
        MartIrc.channels.getElement(channelName).addUser(nickname);
    }

    var widget = new ChannelWidget(MartIrc.channels.getElement(channelName));
    widget.addUser(nickname);
};

IncomingMessage.prototype.removeUserFromChannel = function(nickname, channelName) {
    var self = this;

    if(!MartIrc.channels.hasElement(channelName)){
        return;
    }

    MartIrc.channels.getElement(channelName).removeUser(nickname);

    var widget = new ChannelWidget(MartIrc.channels.getElement(channelName));
    widget.removeUser(nickname);
};

IncomingMessage.prototype.addUsersToChannel = function(users, channelName) {
    var self = this;

    if(!MartIrc.channels.hasElement(channelName)){
        return;
    }

    for (i in users) {
        MartIrc.channels.getElement(channelName).addUser(users[i]);
    }
};

IncomingMessage.prototype.populateChannelUsers = function(channelName) {
    var self = this;

    var widget = new ChannelWidget(MartIrc.channels.getElement(channelName));
    widget.populateUsers();
    widget.focus();
};

IncomingMessage.prototype.setChannelTopic = function(topic, channelName) {
    var self = this;

    MartIrc.channels.getElement(channelName).topic = topic;

    var widget = new ChannelWidget(MartIrc.channels.getElement(channelName));

    if(widget.isActive()){
        widget.focus();
    }
};

IncomingMessage.prototype.restoreChannels = function() {
    var self = this;

    var channelWidget = null;

    MartIrc.channels = MartIrc.storage.getChannels(MartIrc.ircConnection.settings.ircServerHost);

    if(!MartIrc.channels.countElement()){
        return null;
    }

    for(name in MartIrc.channels.get()){
        if(name[0] === '#'){
            MartIrc.ircConnection.join(name);

            channelWidget = new ChannelWidget(MartIrc.channels.getElement(name));
        } else {
            channelWidget = new UserWidget(MartIrc.channels.getElement(name));
        }

        MartIrc.channels.setActiveChannel(name);
        channelWidget.create();
    }

    channelWidget.focus();
};

IncomingMessage.prototype.scanMessage = function(rawMsg) {
    var self = this;

    var msg = self.utils.escape(rawMsg);

    var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

    return msg.replace(regex, " <a href=\"$&\" target=\"_blank\">$&</a> ");
};
