export class Foo {
};

export class Bar extends Foo {
  constructor() {
    super();
  }
};

export var test = new Bar();
