/**
* Irc-connection constructor
*
* @contructor
*
*/
IrcConnection = function(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.socket = null;

    self.settings = {
        nodeServerHost: options.nodeServerHost
        , nodeServerPort: options.nodeServerPort
        , ircServerHost: options.ircServerHost
        , ircServerPort: options.ircServerPort
        , nickname: options.nickname
    };

    self.init();
    self.bindEvents();
};


/**
* Irc connection init
*
*/
IrcConnection.prototype.init = function() {
    var self = this;

    self.socket = new io.Socket(self.settings.nodeServerHost, {port: self.settings.nodeServerPort});
    self.socket.connect();

    var data = {
        type: 'connect', data: 
        {
            ircHost: self.settings.ircServerHost
            , ircPort: self.settings.ircServerPort
            , nick: self.settings.nickname
        }
    };

    console.log(data);

    self.socket.send(data);

    self.socket.on('message', function(incomingMessage) {
        self.parseIncomingMessage(incomingMessage);
    });
};


/**
 * Parsing incoming messages
 * Using Pan_PG Parser/Walker
 */

IrcConnection.prototype.parseIncomingMessage = function (incomingMessage) {
    var self = this;

    console.log('message received: ' + incomingMessage.content);

    var message = {
        channel: 'server'
        , content: incomingMessage.content
    }

    var compiler = new Compiler();
    var compiledMessage = compiler.compile(message.content);

    $(this).trigger('irc.'+compiledMessage.command, compiledMessage);

    return message;
}

/**
 * Bind built-in events
 */

IrcConnection.prototype.bindEvents = function () {
    var self = this;

    //Basic client to keep the connection alive
    $(this).bind('irc.ping',function(event, data) { 
        var data = {
            type: 'message', data:
            {
                message:'PONG ' + ':' + data.params[0]
            }
        };

        console.log(data);
        self.socket.send(data);
    });
}

IrcConnection.prototype.connected = function() {
    var self = this;

    return (self.socket && self.socket.connected);
}


IrcConnection.prototype.disconnect = function() {
    var self = this;

    self.socket.disconnect();
}
