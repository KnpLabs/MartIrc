var path = require('path');

require.paths.unshift( path.join( __dirname,'lib') )

var MartIrc = require('martirc');

new MartIrc({
    port: 3000
    , encoding: "utf-8"
});

process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

