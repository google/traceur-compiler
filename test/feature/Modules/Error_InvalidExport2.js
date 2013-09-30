// Should not compile.
// Error: 'c' is not exported by

module 'a' {}

module 'b' {
  export {c as d} from 'a';
}
