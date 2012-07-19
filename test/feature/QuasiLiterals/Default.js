assertEquals('', ``);
assertEquals('a', `a`);
assertEquals('"', `"`);
assertEquals("'", `'`);
assertEquals("`", `\``);
assertEquals('"', `\"`);

assertEquals('\\"', `\\"`);
assertEquals('"\\', `"\\`);

assertEquals('\n', `\n`);
assertEquals('\r', `\r`);
assertEquals('\r\n', `\r\n`);
assertEquals('\t', `\t`);
assertEquals('\u2028', `\u2028`);
assertEquals('\u2029', `\u2029`);

assertEquals('$', `$`);
assertEquals('$ a', `$ a`);
assertEquals('$ {a}', `$ {a}`);

assertEquals('undefined', `${ undefined }`);
assertEquals('null', `${ null }`);

{
  let $ = 'DOLLAR';
  let $$ = 'DD'
  assertEquals('$$', `$$`);
  assertEquals('DOLLAR', `${$}`);
  assertEquals('$$$', `$$$`);
  assertEquals('DOLLARDOLLAR', `${$}${$}`);
  assertEquals('DOLLAR$$', `${$}$$`);
  assertEquals('$$DOLLAR', `$$${$}`);
  assertEquals('$$$', `\$$$`);

  let a = 'A';
  let b = 'B';
  assertEquals('aAbB', `a${a}b${b}`);
  assertEquals('aAb$b', `a${a}b$b`);
  assertEquals('$a.$b', `$a.$b`);

  let x = 3;
  let y = 5;

  assertEquals('3 + 5 = 8', `${x} + ${y} = ${ x + y}`);

  // nested
  assertEquals('3 + 5 = 8', `${x} + ${ `${y} = ${ `${x + y}` }` }`);
}

// Line continuations
assertEquals('ab', `a\
b`);
assertEquals('ab', `a\
\
b`);

assertEquals('\n', `
`);
assertEquals('\n\n', `

`);
