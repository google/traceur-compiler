var object = {
  set x(value) this._x = value,
  set y(value) this._y = value
  set z(value) this._z = value
};

object.x = 1;
object.y = 2;
object.z = 3;

assertEquals(1, object._x);
assertEquals(2, object._y);
assertEquals(3, object._z);
