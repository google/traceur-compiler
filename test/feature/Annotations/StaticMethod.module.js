// Options: --annotations
import {Anno} from './resources/setup.js';

class StaticMethod {
  @Anno
  static method(@Anno x) {}
}

assertArrayEquals([new Anno], StaticMethod.method.annotations);
assertArrayEquals([[new Anno]], StaticMethod.method.parameters);
