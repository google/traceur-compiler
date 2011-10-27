function f() {
  return 'outer';
}

{
  (function f() {
    return 'inner';
  });

  assertEquals('outer', f());
}

assertEquals('outer', f());
