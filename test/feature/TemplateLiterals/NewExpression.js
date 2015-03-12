// Options: --block-binding
/*
{
  let i = 0, log = [];
  this.log = function(...e) {
    log.push(e.join(" "));
  }

  // https://crbug.com/450942
  assert.equals("object", typeof (new Function`log("a")`));
  assert.equals(["a"], log);

  log.length = 0;
  function tag(...e) {
    var text = String.raw(...e);
    if (this instanceof tag) {
      log.push("new;" + text);
    } else {
      log.push("tag;" + text);
      return tag;
    }
  }
  assert.equals("object", typeof (new tag`a``b``c`));
  assert.equals([
    "tag;a",
    "tag;b",
    "tag;c",
    "new;"
  ], log);
}
*/
