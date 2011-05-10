module a = require("test_a.js");
module b = require("test_b.js");
module c = require("test_c.js");

export a.{a: name};
export b.{b: name};
export c.{c: name};

export var name = 'test';
