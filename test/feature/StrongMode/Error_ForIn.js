// Options: --strong-mode
// Error: :7:12: for in loops are not allowed in strong mode
// Error: :12:8: for in loops are not allowed in strong mode

'use strong'

for (var x in {x: 1}) {
  x;
}

var y;
for (y in {x: 1}) {
  y;
}
