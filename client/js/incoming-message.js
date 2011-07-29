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
        self.populateChannelUsers(data.params[3].split(' '), data.params[2]);
        break;
    case '376':
        self.restoreChannels();
        break;
    }
};

IncomingMessage.prototype.receiveMessage = function(channel, nickname, rawMsg) {
    var self = this;

    if(channel === MartIrc.ircConnection.settings.nickname){
        channel = nickname;
    }

    if (!MartIrc.channels[channel]) {
        var user = new User(channel);
        user.create();
        MartIrc.channels[channel] = user;
    }

    MartIrc.channels[channel].addMessage(nickname, self.scanMessage(rawMsg));

    MartIrc.channels[channel].scrollAtTheEnd();
};

IncomingMessage.prototype.changeNickname = function(oldNickname, newNickname) {
    var self = this;

    for(name in MartIrc.channels){

        if(MartIrc.channels[name] instanceof Channel){
            if(MartIrc.channels[name].hasUser(oldNickname)){
                MartIrc.channels[name].renameUser(oldNickname, newNickname);
            }
        } else {

            if(name == oldNickname){
                MartIrc.channels[newNickname] = MartIrc.channels[oldNickname];
                MartIrc.channels[newNickname].rename(newNickname);

                delete MartIrc.channels[oldNickname];
            }
        }
    }
};

IncomingMessage.prototype.addUserToChannel = function(nickname, channelName) {
    var self = this;

    if(nickname != MartIrc.ircConnection.settings.nickname){
        MartIrc.channels[channelName].addUser(new User(nickname));
    }
};

IncomingMessage.prototype.removeUserFromChannel = function(nickname, channelName) {
    var self = this;

    if(!MartIrc.channels[channelName]){
        return;
    }

    MartIrc.channels[channelName].removeUser(nickname);
};

IncomingMessage.prototype.populateChannelUsers = function(users, channelName) {
    var self = this;

    if(!MartIrc.channels[channelName]){
        return;
    }

    for (i in users) {
        if(users[i] != MartIrc.ircConnection.settings.nickname){
            MartIrc.channels[channelName].addUser(new User(users[i]));
        }
    }
};

IncomingMessage.prototype.setChannelTopic = function(topic, channelName) {
    var self = this;

    MartIrc.channels[channelName].topic = topic;

    if(MartIrc.channels[channelName].isActive()){
        MartIrc.channels[channelName].focus();
    }
};

IncomingMessage.prototype.restoreChannels = function() {
    var self = this;

    MartIrc.channels = MartIrc.storage.getChannels(MartIrc.ircConnection.settings.ircServerHost);

    if(!Object.keys(MartIrc.channels).length){
        return;
    }

    for(name in MartIrc.channels){
        if(MartIrc.channels[name] instanceof Channel){
            MartIrc.ircConnection.join(name);
        }

        MartIrc.channels[name].create();
        MartIrc.channels[name].focus();
    }
};

IncomingMessage.prototype.scanMessage = function(rawMsg) {
    var self = this;

    var msg = self.utils.escape(rawMsg);

    var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

    return msg.replace(regex, " <a href=\"$&\" target=\"_blank\">$&</a> ");
};
