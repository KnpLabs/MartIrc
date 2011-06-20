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


    var message = {
        channel: 'server'
        , content: incomingMessage.content
    };

    var compiler = new Compiler();
    var compiledMessage = compiler.compile(message.content);

    $(this).trigger('irc.'+compiledMessage.command, compiledMessage);
    $(this).trigger('irc.server', compiledMessage);

    return message;
}

/**
* Bind built-in events
*/

IrcConnection.prototype.bindEvents = function () {
    var self = this;

    //Basic client to keep the connection alive
    $(this).bind('irc.ping',function(event, data) {
        self.pong(data.params[0]);
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

/************** Convenience methods ***************/

IrcConnection.prototype.sendMessage = function(message) {
    var self = this;

    var data = {
        type: 'message', data:
        {
            message: message
        }
    };

    console.log(data);
    self.socket.send(data);

}

IrcConnection.prototype.pong = function(server) {
    var self = this;
    self.sendMessage('PONG ' + ':' + server);
}

/**
* IrcConnection#quit( [message] ) -> self
* - message ( String ): Quit message
*
* Quit the server, passing an optional message.
*
* ### Examples
*
*     irc_instance.quit(); // Quit without a message
*     irc_instance.quit( 'LOLeaving!' ); // Quit with a hilarious exit message
**/
IrcConnection.prototype.quit = function( message ) {
    var self = this;
    // 4.1.6
    this.sendMessage( 'QUIT' + self.if_exists( message, null, ' :' ) );
    return this;
}

/**
* IrcConnection#join( channel[, key] ) -> self
* - channel ( String ): Channel to join
* - key ( String ): Channel key
*
* Start listening for messages from a given channel.
*
* ### Examples
*
*     irc_instance.join( '#asl' ); // Join the channel `#asl`
*     irc_instance.join( '#asxxxl', 'lol123' ); // Join the channel `#asxxl` with the key `lol123`
**/
IrcConnection.prototype.join = function ( channel, key ) {
    var self = this;
    // 4.2.1
    return self.sendMessage( 'JOIN' + self.param( channel ) + self.if_exists( key ) )
};


/**
* IRC#part( channel ) -> self
* - channel ( String ): Channel to part
*
* Stop listening for messages from a given channel
*
* ### Examples
*
*     irc_instance.part( '#asl' ); // You've had your fill of `#asl` for the day
**/
IrcConnection.prototype.part = function( channel ) {
    var self = this;
    // 4.2.2
    return self.sendMessage( 'PART' + self.param( channel ) );
};

IrcConnection.prototype.names = function ( channel ) {
    var self = this;
    // 4.2.1
    return self.sendMessage( 'NAMES' + self.param( channel ));
};


IrcConnection.prototype.privmsg = function ( receiver, msg ) {
    var self = this;

    self.sendMessage( 'PRIVMSG' + self.param( receiver ) + ' ' + self.param( msg || '', null, ':' ) );
};

/**
* IRC#nick( nickname ) -> self
* - nickname ( String ): Desired nick name.
*
* Used to set or change a user's nick name.
*
* ### Examples
*
*     irc_instance.nick( 'Jeff' ) // Set user's nickname to `Jeff`
**/
IrcConnection.prototype.nick = function( nickname ) {
    var self = this;
    // 4.1.2
    self.sendMessage( ( self.settings.nickname === undefined ? '' : ':' + self.settings.nickname + ' ' ) + 'NICK' + self.param( nickname ) );
};


/* ------------------------------ MISCELLANEOUS ------------------------------ */
IrcConnection.prototype.if_exists = function ( data, no_pad, pad_char ) {
    return data ? param( data, no_pad, pad_char ) : '';
}

IrcConnection.prototype.param = function ( data, no_pad, pad_char ) {
    return ( no_pad ? '' : ( pad_char ? pad_char : ' ' ) ) + data.toString();
}

IrcConnection.prototype.not_blank = function ( item ) {
    return ( !!item && item.toString().replace( /\s/g, '' ) != '' );
}
