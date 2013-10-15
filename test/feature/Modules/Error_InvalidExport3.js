// Should not compile.
// Error: 'c' is not exported by 'feature/Modules/b'

module 'a' {
  module 'b' {
    module 'c' {};
  }
  export {c as d} from 'b';
}
