
// From: http://traitsjs.org/tutorial.html

// *** Original Trait.js version

var EnumerableTrait = Trait({
  // the trait requires these properties
  forEach: Trait.required,

  // the trait provides these properties:
  map: function(fun) {
    var seq = [];
    this.forEach(function(e,i) {
      seq.push(fun(e, i));
    });
    return seq;
  },
  filter: function(pred) {
    var seq = [];
    this.forEach(function(e,i) {
      if (pred(e, i)) {
        seq.push(e);
      }
    });
    return seq;
  },
  reduce: function(init, fun) {
    var result = init;
    this.forEach(function(e,i) {
      result = fun(result, e, i);
    });
    return result;
  },
  contains: function(e) {
    var result = this.filter(function(elt) { return elt === e; });
    return result.length > 0;
  }
});

var ComparableTrait = Trait({
  '<': Trait.required, // this['<'](other) -> boolean
  '==': Trait.required, // this['=='](other) -> boolean

  '<=': function(other) {
    return this['<'](other) || this['=='](other);
  },
  '>': function(other) {
    return other['<'](this);
  },
  '>=': function(other) {
    return other['<'](this) || this['=='](other);
  },
  '!=': function(other) {
    return !(this['=='](other));
  }
});

function makeInterval(min, max) {
  return Trait.create(Object.prototype,
      Trait.compose(
      Trait.resolve({ contains: undefined }, EnumerableTrait),
      ComparableTrait,
      Trait({
        start: min,
        end: max,
        size: max - min - 1,
        toString: function() { return '' + min + '..!' + max; },
        '<': function(ival) { return max <= ival.start; },
        '==': function(ival) { return min == ival.start && max == ival.end; },
        contains: function(e) { return (min <= e) && (e < max); },
        forEach: function(consumer) {
          for (var i = min; i < max; i++) {
            consumer(i, i - min);
          }
        }
      })));
}

// *** Traceur version:

trait EnumerableTrait {
  // the trait requires these properties
  requires forEach;

  // the trait provides these properties:
  function map(fun) {
    var seq = [];
    this.forEach(function(e, i) {
      seq.push(fun(e, i));
    });
    return seq;
  }
  function filter(pred) {
    var seq = [];
    this.forEach(function(e, i) {
      if (pred(e, i)) {
        seq.push(e);
      }
    });
    return seq;
  }
  function reduce(init, fun) {
    var result = init;
    this.forEach(function(e, i) {
      result = fun(result, e, i);
    });
    return result;
  }
  function contains(e) {
    var result = this.filter(function(elt) { return elt === e; });
    return result.length > 0;
  }
}

trait ComparableTrait {
  requires lessThan; // this.lessThan(other) -> boolean
  requires equals; // this.equals(other) -> boolean

  function lessThanOrEquals(other) {
    return this.lessThan(other) || this.equals(other);
  }
  function greaterThan(other) {
    return other.lessThan(this);
  }
  function greaterThanOrEquals(other) {
    return other.lessThan(this) || this.equals(other);
  }
  function notEquals(other) {
    return !(this.equals(other));
  }
}

class Interval {
  mixin EnumerableTrait { contains: undefined };
  mixin ComparableTrait;

  new(min, max) {
    this.start = min;
    this.end = max;
    this.size = max - min - 1;
  }

  function toString() {
    return '' + this.start + '..!' + this.end;
  }
  function lessThan(ival) {
    return this.end <= ival.start;
  }
  function equals(ival) {
    return this.start == ival.start && this.end == ival.end;
  }
  function contains(e) {
    return (this.start <= e) && (e < this.end);
  }
  function forEach(consumer) {
    for (var i = this.start; i < this.end; i++) {
      consumer(i, i - this.start);
    }
  }
}

var i1 = new Interval(0, 5);
var i2 = new Interval(7, 12);
alert('' + i1 + ' == ' + i2 + ': ' + i1.equals(i2));
alert('' + i1 + ' < ' + i2 + ': ' + i1.lessThan(i2));
