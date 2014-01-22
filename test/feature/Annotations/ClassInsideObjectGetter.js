// Options: --annotations
import {Anno} from './resources/setup';

var object = {
  get foo() {
    class Foo {
      @Anno
      get b() {}
    }
    return Foo;
  }
};

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(object.foo.prototype, 'b').get.annotations);

