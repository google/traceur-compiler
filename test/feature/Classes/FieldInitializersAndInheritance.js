class FieldInitializersAndInheritanceCounter {
  var value = 0;
  function next() { return this.value++; }
}

var counter = new FieldInitializersAndInheritanceCounter();

class BaseFieldInitializers {
  var b = counter.next();

  var be;
  
  new() {
    this.be = counter.next();
  }
}

class DerivedFieldInitializers : BaseFieldInitializers {
  var d = counter.next();
  var de;
  new() {
    this.de = counter.next();
    BaseFieldInitializers.prototype.constructor.call(this);
  }
}

// ----------------------------------------------------------------------------

var obj = new DerivedFieldInitializers();
assertEquals(0, obj.b);
assertEquals(1, obj.d);
assertEquals(2, obj.de);
assertEquals(3, obj.be);

DerivedFieldInitializers.prototype.constructor.call(obj);
assertEquals(0, obj.b);
assertEquals(1, obj.d);
assertEquals(4, obj.de);
assertEquals(5, obj.be);

DerivedFieldInitializers.call(obj);
assertEquals(6, obj.b);
assertEquals(7, obj.d);
assertEquals(8, obj.de);
assertEquals(9, obj.be);
