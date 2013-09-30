// Should not compile.
// Error: :15:10: Duplicate export declaration 'a'
// Error: :14:10: Location related to previous error

module 'm' {
  export var a = 1;
}

module 'n' {
  export var a = 2;
}

module 'o' {
  export * from 'm';
  export * from 'n';
}
