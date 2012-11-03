// Should not compile.
// Error: :14:20: Duplicate export declaration 'a'
// Error: :14:10: Location related to previous error

module m {
  export var a = 1;
}

module n {
  export var a = 2;
}

module o {
  export * from m, * from n;
}
