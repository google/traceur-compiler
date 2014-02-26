// Options: --types=true --type-assertions --type-assertion-module=./resources/assert

function foo(a: string): boolean {
  var x: number = 1;
  return true;
}

function failReturn(): number {
  return 'str';
}

function failVariable() {
  var x: string = true;
}


foo('bar');
assert.throw(() => { foo(123) }, chai.AssertionError);
assert.throw(() => { failReturn() }, chai.AssertionError);
assert.throw(() => { failVariable() }, chai.AssertionError);
