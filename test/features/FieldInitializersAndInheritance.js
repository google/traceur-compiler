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


