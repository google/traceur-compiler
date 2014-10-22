import {x} from './reexport-x';
var path = require('path');
var aNodeModule = require('./aNodeModule.js');

if (path && path.resolve && aNodeModule.aNodeExport) {
	var nodeExport = aNodeModule.aNodeExport;
  console.log(`we have path and x=${x} and aNodeExport=${nodeExport}`);
}