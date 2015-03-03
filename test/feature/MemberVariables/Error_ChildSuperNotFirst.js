// Options: --member-variables --types
// Error: :10:5: 'this' is not allowed before super()

class A {
}

class C extends A {
  shouldFail: boolean = true;
  constructor() {
    this.value = 5;
    // super() should be first when a derived class contains initialized
    // instance variable
    super();
  }
}
