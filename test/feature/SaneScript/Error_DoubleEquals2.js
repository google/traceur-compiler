// Options: --strong-mode
// Error: :8:3: == is not allowed in strong mode
// Error: :9:3: != is not allowed in strong mode

'use strong'
'use strict'

1 == 2;
3 != 4;
