import fs from 'fs';
import path from 'path';

var src = fs.readFileSync(path.resolve(__dirname, 'node-require.js'), 'utf8');
assert.isTrue(
    src.indexOf('fs ' + '= $__interopRequire("fs").default') !== -1);
assert.isTrue(
    src.indexOf('path ' + '= $__interopRequire("path").default') !== -1);
