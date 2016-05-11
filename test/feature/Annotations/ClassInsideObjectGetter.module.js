// Options: --annotations
import {Anno} from './resources/setup.js';

var object = {
  get foo() {
    class Foo {
      @Anno
      get b() {}
    }
    return Foo;
  }
};

assert.deepEqual([new Anno],
    Object.getOwnPropertyDescriptor(object.foo.prototype, 'b').get.annotations);

