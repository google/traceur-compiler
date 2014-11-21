// Options: --member-variables --types

class Base {
  base: boolean;
  baseInitValue: boolean = true;
  initIn: string = 'Base';

  constructor() {
    this.base = this.baseInitValue;
  }
}

class DerivedImplicitCtor extends Base {
  initIn: string = 'DerivedImplicitCtor';
}

var derivedImplicitCtor = new DerivedImplicitCtor();
assert.equal(derivedImplicitCtor.initIn, 'DerivedImplicitCtor');
assert.equal(derivedImplicitCtor.base, true);

class DerivedWithCtor extends Base {
  initIn: string = 'DerivedWithCtor';

  constructor() {
    super();
  }
}

var derivedWithCtor = new DerivedWithCtor();
assert.equal(derivedWithCtor.initIn, 'DerivedWithCtor');
assert.equal(derivedWithCtor.base, true);
