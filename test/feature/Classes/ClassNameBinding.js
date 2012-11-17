
var ClassExpr = class {
  m() {
    return ClassExpr;
  }
}

var TempClass = ClassExpr;
ClassExpr = 42;

assertEquals(42, new TempClass().m());

//////////////////////////////////////////////////////////////////////////////

var ClassExpr2 = class ClassExprInner {
  m() {
    return ClassExprInner;
  }
}

TempClass = ClassExpr2;
ClassExpr2 = 42;

assertEquals(TempClass, new TempClass().m());

//////////////////////////////////////////////////////////////////////////////

class ClassDef {
  m() {
    return ClassDef;
  }
}

var TempClass = ClassDef;
ClassDef = 42;

assertEquals(42, new TempClass().m());
