// Options: --member-variables --types
// Error: :8:3: Derived constructor must call super()

class A {
}

class C extends A {
  constructor() {
    // "super()" is required in derived class
  }
}
