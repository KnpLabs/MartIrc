var fs = require( 'fs' )
  , path = require( 'path' )

require.paths.unshift( path.join( __dirname, '..', 'lib' ) )

var ClientServerMapper = require( 'client-server-mapper' );


/* ------------------------------ Fixtures ------------------------------ */

var clientId = 1;
var serverId = 1;

function getClientWithoutUuid() {

    var client = {
        name: 'some client name'
        , description: 'some client description'
    };

    return client;

}


function getClient() {
    var client = getClientWithoutUuid();
    client.uuid = clientId++;

    return client;
}

function getServerWithoutUuid() {
    var server = {
        name: 'some server name'
        , description: 'some server description'
    };

    return server;
}


function getServer() {
    var server = getServerWithoutUuid();
    server.uuid = serverId++;

    return server;
}
exports['uuid exception'] = function(test) {
    var mapper = new ClientServerMapper();

    client = getClientWithoutUuid();
    server = getServerWithoutUuid();

    test.throws(
            function() {
                mapper.map(client, server);
            },
            '/uuid/'
    );

    test.finish();
};


exports['map'] = function(test) {
    var mapper = new ClientServerMapper();

    var client = getClient();
    var server = getServer();

    test.doesNotThrow(
            function() {
                mapper.map(client, server);
            },
            '/uuid/'
    );

    clientMapped = mapper.getClientForServer(server);
    test.equal(clientMapped.uuid,client.uuid);

    serverMapped = mapper.getServerForClient(client);
    test.equal(serverMapped.uuid,server.uuid);

    var newClient = getClient();

    test.throws(
            function() {
                mapper.map(newClient, server);
            },
            '/exists/'
    );


    test.finish();
};

/* ------------------------------ Run ------------------------------ */
if ( module == require.main )
  require( 'async_testing' ).run( __filename, process.ARGV )
