var path = require('path');

require.paths.unshift( path.join( __dirname,'vendor') )
require.paths.unshift( path.join( __dirname,'vendor','coloured-log','lib') )

var MartIrc = require('./lib/martirc');

new MartIrc({ port: 3000 });

process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

