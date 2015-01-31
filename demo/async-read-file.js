// Run this with
//
//   traceur --experimental async-read-file.js file-to-read

function asyncReadFile(file) {
  return new Promise((resolve, reject) => {
    require('fs').readFile(file, 'utf8', (err, data) => {
      if (err)
        reject(err);
      else
        resolve(data);
    });
  });
}

(async function() {
  var filename = process.argv[4];
  console.log(`Loading ${filename}...`);
  try {
    var data = await asyncReadFile(filename);
    console.log(`${filename} has ${data.split('\n').length} lines`);
  } catch (ex) {
    console.error(ex);
  }
})();
