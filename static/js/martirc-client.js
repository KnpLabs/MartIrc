/**
* Main client constructor
*
* @contructor
*
*/
MartIrcClient = function(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.ircConnection = null;

    self.init();
};


/**
* MartIrc init
*
*/
MartIrcClient.prototype.init = function() {
    var self = this;

};


MartIrcClient.prototype.connect = function (nodeServerHost, nodeServerPort, ircServerHost, ircServerPort, nickname)
{
    var self = this;

    if(self.ircConnection && self.ircConnection.connected()){
        self.ircConnection.disconnect();
    }

    self.ircConnection = new IrcConnection({
        nodeServerHost: nodeServerHost
        , nodeServerPort: nodeServerPort
        , ircServerHost: ircServerHost
        , ircServerPort: ircServerPort
        , nickname: nickname
    });

    $(self.ircConnection).bind('irc.server',function(event, data) { 
        console.log(data.raw);
        //@TODO: see how to rethrow a message automatically
        $(self).trigger('irc.server', data);
    });

}


/**
* MartIrc sendRawMessage
*
*/
MartIrcClient.prototype.sendRawMessage = function(message) {
    var self = this;

    self.ircConnection.sendMessage(message);
};
