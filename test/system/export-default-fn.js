export default {
  fn: function bar() {

    function test() {
    }

    function foo() {
      test();
    }

    return {
      foo: foo
    }
  }
};