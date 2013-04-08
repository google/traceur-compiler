// Run this with
//
//   traceur --experimental async-read-file.js file-to-read

function lineCount(file) {
  var data;
  try {
    // TODO: make await an expression.
    await data = require('fs').readFile(file, 'utf8');
    console.log(`${file} has ${data.split('\n').length} lines`);
  } catch (ex) {
    console.error(ex);
  }
}

var fileName = process.argv[2];
lineCount(fileName);
console.log(`Loading ${fileName}...`);
