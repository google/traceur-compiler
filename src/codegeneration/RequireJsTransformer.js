// Copyright 2013 Traceur Authors.
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

import {ModuleTransformer} from './ModuleTransformer';
import {VAR} from '../syntax/TokenType';
import {parseStatements} from './PlaceholderParser';
import {createBindingIdentifier} from './ParseTreeFactory';


export class RequireJsTransformer extends ModuleTransformer {

  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.dependencies = [];
  }

  wrapModule(statements) {
    var depPaths = this.dependencies.map((dep) => dep.path);
    var depLocals = this.dependencies.map((dep) => dep.local);

    return parseStatements
        `define(${depPaths}, function(${depLocals}) {
          ${statements}
        });`;
  }

  transformModuleSpecifier(tree) {
    var depPath = this.normalizeDependencyPath(tree.token.processedValue);
    var localName = this.getTempIdentifier();

    this.dependencies.push({path: depPath, local: localName});

    return createBindingIdentifier(localName);
  }

  normalizeDependencyPath(path) {
    // Ignore urls.
    if (/^https?\:\/\//.test(path)) {
      return path;
    }

    // "http.js" -> "./http.js"
    if (path[0] !== '.') {
      path = './' + path;
    }

    // Remove ".js" suffix, otherwise RequireJS will treat the dependency as a script.
    path = path.replace(/\.js$/, '');

    return path;
  }
}
