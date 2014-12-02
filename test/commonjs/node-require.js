import fs from 'fs';
import path from 'path';

assert.equal('"use strict";\nvar $__fs__,\n    $__path__;',
    fs.readFileSync(path.resolve(__dirname, 'node-require.js'))
    .toString().substr(0, 41));