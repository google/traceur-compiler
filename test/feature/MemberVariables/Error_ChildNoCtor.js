// Options: --member-variables --types
// Error: :8:3: Constructors of derived class must contain a super call

class A {
}

class C extends A {
  constructor() {
    // "super()" is required in derived class
  }
}
