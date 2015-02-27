// Verify process.argv in a file of es6 code.
let theArgs = process.argv.slice(2);
console.log(['args', ...theArgs].join(''));

var checkRequire = require('./iAmScript.js');
