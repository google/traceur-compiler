// Options: --member-variables --types
// Error: :10:4: Derived constructor must call super()

class A {
}

class C extends A {
  constructor() {
    // "super()" is required in derived class
  }
}
