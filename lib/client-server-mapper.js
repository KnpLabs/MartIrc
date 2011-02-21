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


    return this;

}


/**
 * ClientServerMapper#getClientForServer(server) -> client
 *
 * Find a client mapped to a server
 **/
ClientServerMapper.prototype.getClientForServer = function(server) {
    var self = this;


    return this;

}


/**
 * ClientServerMapper#getServerForClient(client) -> server
 *
 * Find a server mapped to a client
 **/
ClientServerMapper.prototype.getServerForClient = function(client) {
    var self = this;


    return this;

}
