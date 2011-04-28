class LetInClass {
  x, y;

  get z() {
    let let_z = 10;
    return let_z;
  }

  set z(v) {
    let let_zv = v;
  }

  function distance() {
    let dist = this.y - this.x;
    return dist;
  }
}

// ----------------------------------------------------------------------------
