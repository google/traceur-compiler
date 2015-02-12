// Options: --strong-mode
// Error: :7:3: == is not allowed in strong mode
// Error: :8:3: != is not allowed in strong mode

'use strong'

1 == 2;
3 != 4;
