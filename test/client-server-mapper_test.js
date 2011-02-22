var fs = require( 'fs' )
  , path = require( 'path' )

require.paths.unshift( path.join( __dirname, '..', 'lib' ) )

var ClientServerMapper = require( 'client-server-mapper' );


/* ------------------------------ Fixtures ------------------------------ */

var client = {
        , name: 'some client name'
        , description: 'some client description'
};


var server = {
        , name: 'some server name'
        , description: 'some server description'
};

exports['uuid exception'] = function(test) {
    var mapper = new ClientServerMapper();

    test.throws(
            function() {
                mapper.map(client, server);
            },
            '/uuid/'
    );

    test.finish();
};

/* ------------------------------ Run ------------------------------ */
if ( module == require.main )
  require( 'async_testing' ).run( __filename, process.ARGV )
