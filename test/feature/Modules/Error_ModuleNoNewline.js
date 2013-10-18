// Should not compile.
// Error: :9:3: Semi-colon expected

module 'm' {
  export var x = 42;
}

module
m from 'm';
