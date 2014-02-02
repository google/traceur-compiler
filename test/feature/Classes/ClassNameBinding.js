
var ClassExpr = class {
  m() {
    return ClassExpr;
  }
}

var TempClass = ClassExpr;
ClassExpr = 42;

assert.equal(42, new TempClass().m());
assert.equal(TempClass.name, '');

//////////////////////////////////////////////////////////////////////////////

var ClassExpr2 = class ClassExprInner {
  m() {
    return ClassExprInner;
  }
}

TempClass = ClassExpr2;
ClassExpr2 = 42;

assert.equal(TempClass, new TempClass().m());
assert.equal(TempClass.name, 'ClassExprInner');

//////////////////////////////////////////////////////////////////////////////

class ClassDef {
  m() {
    return ClassDef;
  }
}

var TempClass = ClassDef;
ClassDef = 42;

assert.equal(TempClass, new TempClass().m());
assert.equal(TempClass.name, 'ClassDef');
