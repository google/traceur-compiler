// Options: --strong-mode

'use strong';

assert.equal((function() { return this })(), undefined);

