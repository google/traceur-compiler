function f() {
  return 'outer';
}

{
  function f() {
    return 'inner';
  }

  assertEquals('inner', f());
}

assertEquals('outer', f());
