// Options: --strong-mode
// Error: :11:5: Unexpected reserved word let
// Error: :14:5: Unexpected reserved word const
// Error: :17:5: Unexpected reserved word function
// Error: :20:5: Unexpected reserved word class

'use strong';

switch (1) {
  case 2:
    let x;
    break;
  case 3:
    const y = 4;
    break;
  case 5:
    function f() {}
    break;
  default:
    class C {}
    break;
}
