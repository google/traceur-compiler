import {x} from './reexport-x';
var path = require('path');

if (path && path.resolve) {
	console.log('we have path and x=' + x);
}