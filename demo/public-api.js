var traceur = require('traceur');

var src = 'function foo() { return 1; }';
// To list options, use command line ./traceur --help
var options = {};

var compiled = traceur.compile(src, options);

console.log('Traceur input ', src);
console.log('Traceur options ', options);
console.log('Traceur output ', compiled);