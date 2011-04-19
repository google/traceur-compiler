
// From: http://howtonode.org/traitsjs

// *** Original Trait.js version

var TEquality = Trait({
  equals: Trait.required,
  differs: function(x) { return !this.equals(x); }
});

var TMagnitude = Trait.compose(TEquality, Trait({
  smaller: Trait.required,
  greater: function(x) { return !this.smaller(x) && this.differs(x) },
  between: function(min, max) {
    return min.smaller(this) && this.smaller(max);
  }
}));

function TColor(rgb) {
  return Trait.compose(TEquality, Trait({
    get rgb() { return rgb; },
    equals: function(col) { return col.rgb.equals(this.rgb); }
  }));
}

function TCircle(center, radius, rgb) {
  return Trait.compose(
      TMagnitude,
      TEquality,
      Trait.resolve({ equals: 'equalColors' }, TColor(rgb)),
      Trait({
        center: center,
        radius: radius,
        area: function() { return Math.PI * this.radius * this.radius; },
        equals: function(c) { return c.center === this.center &&
              r.radius === this.radius },
        smaller: function(c) { return this.radius < c.radius }
      }));
}

function Circle(center, radius, rgb) {
  return Object.create(Object.prototype,
                       TCircle(center, radius, rgb));
}

var c1 = Circle(new Point(0, 0), 1, new Color(255, 0, 0));
var c2 = Circle(new Point(0, 0), 2, new Color(255, 0, 0));
c1.smaller(c2); // true
c1.differs(c2); // true


// *** Traceur version:
// TODO(jmesserly): this doesn't run yet. we need to figure out how trait
// constructors should work syntactically

trait TEquality {
  requires equals;
  function differs(x) {
    return !this.equals(x);
  }
}

trait TMagnitude {
  new() {
    mixin TEquality;
  }
  requires smaller;
  function greater(x) {
    return !this.smaller(x) && this.differs(x);
  }
  function between(min, max) {
    return min.smaller(this) && this.smaller(max);
  }
}

trait TColor {
  new(rgb) {
    mixin TEquality;
    this.rgb = rgb;
  }
  get rgb() { return this.rgb; },
  function equals(col) { return col.rgb.equals(this.rgb); }
}

class Circle {
  new(center, radius, rgb) {
    mixin TMagnitude;
    mixin TEquality;
    mixin TColor(rgb) { equals: equalColors };
    this.center = center;
    this.radius = radius;
  }

  function area() {
    return Math.PI * this.radius * this.radius;
  }
  function equals(c) {
    return c.center === this.center && r.radius === this.radius;
  }
  function smaller(c) {
    return this.radius < c.radius;
  }
}

var c1 = new Circle(new Point(0, 0), 1, new Color(255, 0, 0));
var c2 = new Circle(new Point(0, 0), 2, new Color(255, 0, 0));
c1.smaller(c2); // true
c1.differs(c2); // true
