assert.throws(function() {
  var {x} = 1;
}, TypeError);

assert.throws(function() {
  var {x, y} = 1;
}, TypeError);

assert.throws(function() {
  var [x] = 1;
}, TypeError);

assert.throws(function() {
  var [x, y] = 1;
}, TypeError);

assert.throws(function() {
  var {x: {y}} = {x: 1};
}, TypeError);

assert.throws(function() {
  var [[x]] = [1];
}, TypeError);

assert.throws(function() {
  var [...xs] = 1;
}, TypeError);

// Same with assignment expression

assert.throws(function() {
  var x;
  ({x} = 1);
}, TypeError);

assert.throws(function() {
  var x, y;
  ({x, y} = 1);
}, TypeError);

assert.throws(function() {
  var x;
  [x] = 1;
}, TypeError);

assert.throws(function() {
  var x, y;
  [x, y] = 1;
}, TypeError);

assert.throws(function() {
  var y;
  ({x: {y}} = {x: 1});
}, TypeError);

assert.throws(function() {
  var x;
  [[x]] = [1];
}, TypeError);

assert.throws(function() {
  var xs;
  [...xs] = 1;
}, TypeError);
