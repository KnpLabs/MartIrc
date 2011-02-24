/** 
 *  class MartIrc
 *  
 *  An IRC wrapper for Websockets
**/

var irc = require('IRC-js/lib/irc')
    , io = require('Socket.IO-node')
    , sys  = require('sys')
    , http  = require('http')
    , ircBridge  = require('irc-bridge')
    ClientServerMapper = require( 'client-server-mapper' );


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

    self.mapper = new ClientServerMapper();
    //@TODO : use real UUID
    self.clientUuid = 1;
    self.serverUuid = 1;

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

    var server = http.createServer(function(request, response) {});
    var socket = io.listen(server);

    socket.on('connection', function(client){

        client.uuid = self.getClientUuid();

        client.on('message', function(clientMessage){

            console.log("got a message :: "+ clientMessage.type);

            switch(clientMessage.type) {

                // Client wants to connect to an irc server
                case 'connect':

                    var server = self.createIrcServer(
                        clientMessage.data.ircHost
                        , clientMessage.data.ircPort
                        , clientMessage.data.nick
                        , self.settings.encoding
                        , clientMessage.data.channels
                        );

                    self.mapper.map(client, server);

                    console.log("got a client :: "+client.sessionId);

                    break;

                // Client wants to send a message to the server
                case 'message':

                    self.sendMessageToServerFromClient(clientMessage.data.message, client);

                    break;

                // Client wants to be disconnected from the server
                case 'disconnect':
                    self.disconnectClient(client);
                    break;

            }
        });

        client.on('disconnect', function(){ 
            self.disconnectClient(client);

        });
    });


    return server;


};


/**
 * MartIrc#getClientUuid() -> int
 * 
 * Used by the mapper
 **/
MartIrc.prototype.getClientUuid = function() {
    var self = this;
    //@TODO: use real UUID
    
    return self.clientUuid++;
}


/**
 * MartIrc#getServerUuid() -> int
 * 
 * Used by the mapper
 **/
MartIrc.prototype.getServerUuid = function() {
    var self = this;
    //@TODO: use real UUID
    
    return self.serverUuid++;
}

/**
 * MartIrc#createIrcServer(ircHost, ircPort, nick, encoding, channels) -> ircBridge
 * 
 * Create an IRC server connection
 **/
MartIrc.prototype.createIrcServer = function(ircHost, ircPort, nick, encoding, channels) {
    var self = this;

    var server = new ircBridge({
        server: ircHost
        , port: ircPort
        , nick: nick
        , encoding: encoding
    });

    server.uuid = self.getServerUuid();

    server.connect(function() {

    });

    //We're receiving a message from the server
    server.addListener('message', function(message) {
        //@TODO: send it to the client
        var client = self.mapper.getClientForServer(server);
        self.sendMessageToClient(message, client);

    });

    return server;
}


/**
 * MartIrc#disconnectClient(client) -> null
 * - client ( String ): Client
 * 
 * Disconnect a client from IRC
 **/
MartIrc.prototype.disconnectClient = function(client) {
    var self = this;
    console.log("disconnect");

    var server = self.mapper.getServerForClient(client);
    server.quit("Leaving (MartIrc)");

    self.mapper.unmap(client, server);

}


/**
 * MartIrc#sendMessageToServerFromClient(channel, message, clientSessionId) -> null
 * - channel ( String ): The channel to send the message to
 * - message ( String): The message to send
 * - clientId ( String ): Client unique identifier
 * 
 * Send a message comming from a client to the IRC server
 **/
MartIrc.prototype.sendMessageToServerFromClient = function(message, client) {
    var self = this;

    console.log("got a message for server :: "+ message);

    //webClient.client.send({channel: channel, from:'me', message: message});
    var server = self.mapper.getServerForClient(client);
    server.raw(message);


}


/**
 * MartIrc#sendMessageToClient(message, client) -> null
 * - message ( String): The message to send
 * - client ( JSON ): Client
 * 
 * Send a message to a client
 **/
MartIrc.prototype.sendMessageToClient = function(message, client) {
    var self = this;

    console.log("got a message for a client :: "+ message);

    client.send({content: message});


}
module.exports = MartIrc;
