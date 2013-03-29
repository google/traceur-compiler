// Run this with
//
//   traceur --experimental async-read-file.js file-to-read

var async = (fn) => (...args) => {
  var deferred = new Deferred;
  fn(...args, (err, value) => {
    if (err !== null)
      deferred.errback(err);
    else
      deferred.callback(value);
  });
  return deferred.createPromise();
};

function test(file) {
  var data, fs = require('fs');
  try {
    await data = async(fs.readFile)(file, 'utf8');
    console.log(`${file} has ${data.split('\n').length} lines`);
  } catch (ex) {
    console.error(ex);
  }
}

var fileName = process.argv[2];
test(fileName);
console.log(`Loading ${fileName}...`);
