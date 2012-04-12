// These tests are from:
// http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax

const obj = {
  method: function () {
    return () => this;
  }
};
assertEquals(obj.method()(), obj);

let fake = {steal: obj.method()};
assertEquals(fake.steal(), obj);

let real = {borrow: obj.method};
assertEquals(real.borrow()(), real);

