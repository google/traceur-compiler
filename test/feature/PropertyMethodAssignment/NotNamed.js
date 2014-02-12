var object = {
  "notNamedField"() {
    return notNamedField;
  }
};
assert.throws(() => {
  object.notNamedField();
}, ReferenceError);
