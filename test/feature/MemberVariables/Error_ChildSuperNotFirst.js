// Options: --member-variables --types
// Error: :10:5: The first statement of the constructor must be a super call

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
