/**
 *  class ClientServerMapper
 *
**/

var sys  = require('sys');


/* ------------------------------ ClientServerMapper Class ------------------------------ */
/**
 * new ClientServerMapper( options )
 *
 * Creates a new `ClientServerMapper` instance.
 *
 * ### Examples
 *
 *     var ClientServerMapper = new ClientServerMapper();
**/
function ClientServerMapper(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.init();
};


/* ------------------------------ Basic Methods ------------------------------ */

/**
 * ClientServerMapper#init() -> self
 *
 * Init needed variables
 **/
ClientServerMapper.prototype.init = function() {
    var self = this;

    self.clients = [];
    self.servers = [];

    return this;

}


/**
 * ClientServerMapper#map(client,server) -> this
 *
 * Map a client to a server (and a server to a client)
 **/
ClientServerMapper.prototype.map = function(client, server) {
    var self = this;

    if(client.uuid == null) {
        throw new Error("Your client should have an uuid");
    }

    if(server.uuid == null) {
        throw new Error("Your server should have an uuid");
    }

    if(self.clients[server.uuid] != null) {
        throw new Error("A client already exists for this server");
    }

    if(self.servers[client.uuid] != null) {
        throw new Error("A server already exists for this client");
    }

    self.clients[server.uuid] = client;
    self.servers[client.uuid] = server;

    return this;

}


/**
 * ClientServerMapper#map(client,server) -> this
 *
 * Unmap a client and a server
 **/
ClientServerMapper.prototype.unmap = function(client, server) {
//@TODO
}

/**
 * ClientServerMapper#getClientForServer(server) -> client
 *
 * Find a client mapped to a server
 **/
ClientServerMapper.prototype.getClientForServer = function(server) {
    var self = this;

    return self.clients[server.uuid];
}


/**
 * ClientServerMapper#getServerForClient(client) -> server
 *
 * Find a server mapped to a client
 **/
ClientServerMapper.prototype.getServerForClient = function(client) {
    var self = this;

    return self.servers[client.uuid];
}


module.exports = ClientServerMapper;
