// Should not compile.
// Error: :5:16: 'identifier' expected

module m {
  import {x as var} from m2;
}