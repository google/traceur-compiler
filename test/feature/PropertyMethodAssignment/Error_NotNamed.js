// Should not compile.

var object = {
  "notNamedField"() {
    return notNamedField;
  }
};

object.notNamedField();
