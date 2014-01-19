// Options: --annotations
import {Anno} from './resources/setup';

class C {
  @Anno
  get "x y z"() { return 1; }
  @Anno
  get xyz() { return 1; }
}
