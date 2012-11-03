module m {
  export var a = 1;
  export var b = 2;
}

module n {
  export var c = 3;
  export var d = 4;
}

module o {
  export * from m, * from n;
}

assertEquals(1, o.a);
assertEquals(2, o.b);
assertEquals(3, o.c);
assertEquals(4, o.d);
