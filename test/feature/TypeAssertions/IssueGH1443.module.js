// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

// https://github.com/google/traceur-compiler/issues/1443
function issueGH1443():string {
  var a = () => { return 0 };
  a();
  return '';
}

issueGH1443();
