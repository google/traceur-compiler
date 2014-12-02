var fs = require('fs');
var System = require('../src/node/System.js');

System.baseURL = __filename;
System.import('./findUnusedImports.js').then(function(m) {
  var code = m.main(fs);
  process.exit(code);
}).catch(function(err) {
  console.error(err);
  process.exit(1);
});
