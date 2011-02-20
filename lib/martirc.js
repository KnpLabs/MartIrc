/** 
 *  class MartIrc
 *  
 *  An IRC wrapper for Websockets
**/

var irc = require('IRC-js/lib/irc'),
    io = require('Socket.IO-node'),
    sys  = require('sys');


/* ------------------------------ MartIrc Class ------------------------------ */
/**
 * new MartIrc( options )
 * - options ( Object ): Options for specific instance.
 * 
 * Creates a new `MartIrc` instance.
 * 
 * ### Examples
 * 
 *     var MartIrc = new MartIrc( { port: 3000, encoding: 'utf-8' });
**/
function MartIrc(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.settings = {
        port: options.port,
        encoding: options.encoding
    };

    self.init();
};


/* ------------------------------ Basic Methods ------------------------------ */

/**
 * MartIrc#init() -> self
 * 
 * Create and init HTTPServer
 **/
MartIrc.prototype.init = function() {
    var self = this;

    self.webClients = [];

    self.httpServer = self.createHTTPServer();
    self.httpServer.listen(self.settings.port);
    sys.log('Server started on PORT ' + self.settings.port);

    return this;

}


/**
 * MartIrc#createHTTPServer() -> app
 * 
 * Create HTTPServer and bind event for client connection/msg
 **/
MartIrc.prototype.createHTTPServer = function() {
    var self = this;

    var app = require('express/lib/express').createServer();
    var socket = io.listen(app);

    socket.on('connection', function(client){

        client.on('message', function(clientMessage){

            console.log("got a message :: "+ clientMessage.type);

            switch(clientMessage.type) {

                // Client wants to connect to an irc server
                case 'connect':

                    self.createIrcServerForClient(
                        client
                        , clientMessage.data.ircHost
                        , clientMessage.data.ircPort
                        , clientMessage.data.nick
                        , self.settings.encoding
                        , clientMessage.data.channels
                        );

                    break;

                // Client wants to send a message to a channel
                case 'privmsg':

                    self.sendMessageToServerChannelFromClient(
                            clientMessage.data.channel
                            , clientMessage.data.message, client.sessionId);

                    break;

            }
        });

        client.on('disconnect', function(){ 
            self.disconnectClient(client.sessionId);

        });
    });


    return app;


};


/**
 * MartIrc#createIrcServerForClient(client, ircHost, ircPort, nick, encoding, channels) -> null
 * 
 * Create an IRC server connection for a given client (on connect for example)
 **/
MartIrc.prototype.createIrcServerForClient = function(client, ircHost, ircPort, nick, encoding, channels) {
    var self = this;

    var server = new irc({
        server: ircHost
        , port: ircPort
        , nick: nick
        , encoding: encoding
    });

    server.connect(function() {
        setTimeout(function() {
            for(i in channels) {
                server.join(channels[i]);
            }
        }, 2000);
    });

    //We're receiving a PRIVMSG
    server.addListener('privmsg', function(msg) {
        nick = msg.person.nick;
        chan = msg.params[0];
        message = msg.params[1];

        self.sendMessageFromServerChannelToClient(this, chan, nick, message);

    });


    //We're receiving a JOIN message
    server.addListener('join', function(msg) {
        console.log("got a join :: "+msg);
        console.log("my nick :: "+this.nick);
        sys.log(sys.inspect(msg));
    });

    self.webClients.push({session:client.sessionId,client:client, server:server, channels: channels});
    console.log("got a client :: "+client.sessionId+" :: "+self.webClients.length);

    client.send({msgs:[],channels: channels});
}


/**
 * MartIrc#disconnectClient(clientSessionId) -> null
 * - clientSessionId ( String ): Client unique identifier
 * 
 * Disconnect a client from IRC
 **/
MartIrc.prototype.disconnectClient = function(clientSessionId) {
    var self = this;
    var webClient = self.findClientById(clientSessionId);

    console.log("disconnect");

    if(webClient) {
        webClient.server.quit("Leaving (MartIrc)");
        self.removeClientById(clientSessionId);
    }
}


/**
 * MartIrc#sendMessageToServerChannelFromClient(channel, message, clientSessionId) -> null
 * - channel ( String ): The channel to send the message to
 * - message ( String): The message to send
 * - clientSessionId ( String ): Client unique identifier
 * 
 * Send a message comming from a client to the IRC server
 **/
MartIrc.prototype.sendMessageToServerChannelFromClient = function(channel, message, clientSessionId) {
    var self = this;

    console.log("got a message for " + channel + " :: "+ message);

    var webClient = self.findClientById(clientSessionId);

    if(webClient){
        webClient.client.send({channel: channel, from:'me', message: message});
        webClient.server.privmsg(channel, message);
    }


}

/**
 * MartIrc#removeClientById(clientSessionId) -> null
 * - clientSessionId ( String ): Client unique identifier
 * 
 * Remove a client from the client list
 **/
MartIrc.prototype.removeClientById = function(clientSessionId) {
    var self = this;

    if(self.webClients.length != 0) {
        for(i in self.webClients) {
            var webClient = self.webClients[i];

            if(webClient.session == clientSessionId) {
                self.webClients.splice(i,1);
            }
        }
    }
}


/**
 * MartIrc#findClientById(clientSessionId) -> null
 * - clientSessionId ( String ): Client unique identifier
 * 
 * Find a client from the client list 
 **/
MartIrc.prototype.findClientById = function(clientSessionId) {
    var self = this;

    if(self.webClients.length != 0) {
        for(i in self.webClients) {
            var webClient = self.webClients[i];

            if(webClient.session == clientSessionId) {
                return webClient;
            }
        }
    }

    return null;
}

/**
 * MartIrc#sendMessageFromServerChannelToClient(server, channel, from, message) -> null
 * - channel ( String ): The channel to send the message to
 * - from ( String): The message owner
 * - message ( String): The message to send
 * - server ( IRC ): Server object
 * 
 * Send a message comming from an IRC server to the client
 **/
MartIrc.prototype.sendMessageFromServerChannelToClient = function(server, channel, from, message) {
    var self = this;

    var data = {channel: channel, from: from, message: message};

    sys.log(sys.inspect(data));

    if(self.webClients.length != 0) {
        for(i in self.webClients) {
            self.webClient = self.webClients[i];

            if(self.webClient.server == server) {

                for(j in self.webClient.channels) {

                    if(chan.toLowerCase() == self.webClient.channels[j].toLowerCase()) {

                        self.webClient.client.send(data);

                    }
                }
            }
        }
    }

}


module.exports = MartIrc;
