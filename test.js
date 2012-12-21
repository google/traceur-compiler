var test2 = require('./test2.js');

class C {
  static get test() {
    return 42;
  }
}

console.log(`from test.js: ${C.test}`);
console.log(test2);