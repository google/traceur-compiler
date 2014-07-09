// Copyright 2014 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Run test from https://github.com/kangax/compat-table

Reflect.global.exports = {};

import {Compiler} from '../src/Compiler';
import {ParseTreeVisitor} from '../src/syntax/ParseTreeVisitor';

var compiler = new Compiler();

class EvalGetta extends ParseTreeVisitor {
	constructor() {
		this.found = null;
	}
	visitCallExpression(tree) {
		if (tree && tree.operand.identifierToken) {
			var shouldBeEval = tree.operand.identifierToken.value;
			if (shouldBeEval === 'eval') {
				var arg = compiler.treeToString({tree:tree.args,options:{}}).js
				this.found = arg.substring(2, arg.length - 2);
			}
		}
	}
}

var failures = 0;

function checkTest(test, tracuerResult) {
	if (test.res.tr !== tracuerResult) {
		failures++;
		console.error('FAIL: ' + test.name + ' should be ' + !test.res.tr);
	}
}

System.loadAsScript('./test/compat-table/data-es6.js').then(function(tests){
	var unknown = [];
	tests.forEach(function(test) {
		if (typeof test.exec !== 'function') {
			unknown.push(test.name);
		} else {
			var src = 'var f = ' + test.exec + '';

			var m = /eval\(([^\)]*)\)/.exec(src);
			if (m) {
				var parse = compiler.stringToTree({content:src});
				var tree = parse.tree;
				var vistor = new EvalGetta();
				vistor.visit(tree);
				if (vistor.found) {
					try {
						eval(compiler.module(vistor.found).js);
						checkTest(test, true);
					} catch (ex) {
						checkTest(test, false);
					}
				} else {
					unknown.push(test.name);
				}
			} else {
				checkTest(test, test.exec());
			}
		}
	});
	if (!failures) {
		console.log('compat-table PASS, ' + unknown.length +
				' tests could not be run');
	}
}).catch(function(ex) {
	console.log('catch', ex)
	console.error(ex);
});