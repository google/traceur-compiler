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

import {
  CONST,
  IDENTIFIER,
} from '../src/syntax/TokenType';
import {CollectingErrorReporter} from '../src/util/CollectingErrorReporter';
import {Compiler} from '../src/Compiler';
import {
  BINDING_IDENTIFIER,
  IMPORTED_BINDING
} from '../src/syntax/trees/ParseTreeType';
import {ScopeChainBuilder} from '../src/semantics/ScopeChainBuilder';
import {ScopeVisitor} from '../src/semantics/ScopeVisitor';
import {getVariableName} from '../src/semantics/getVariableName';

/**
 * Overrides to also keep track of imported bindings.
 */
class ImportAndScopeChainBuilder extends ScopeChainBuilder {
  constructor(reporter) {
    super(reporter);
    this.imports = Object.create(null);
  }
  visitImportDeclaration(tree) {
    if (tree.importClause.type === IMPORTED_BINDING) {
      this.imports[getVariableName(tree.importClause.binding)] =
          tree.importClause;
    }
    super(tree);
  }
  visitImportSpecifier(tree) {
    var name = getVariableName(tree.rhs || tree.lhs);
    this.imports[name] = tree;
    super(tree);
  }
}

function isImportBinding(binding) {
// TODO(arv): Use IMPORTED_BINDING
  if (binding.type !== CONST) {
    return false;
  }
  switch (binding.tree.type) {
    case IMPORTED_BINDING:
    case BINDING_IDENTIFIER:
    case IDENTIFIER:
      return true;
  }
  return false;
}

class FilterFoundImports extends ScopeVisitor {
  /**
   * @param {ImportAndScopeChainBuilder} scopeBuilder
   */
  constructor(scopeBuilder) {
    super();
    this.scopeBuilder_ = scopeBuilder;
    this.imports = scopeBuilder.imports;
  }

  pushScope(tree) {
    // Override to return the cached scope.
    return this.scope = this.scopeBuilder_.getScopeForTree(tree);
  }

  visitIdentifierExpression(tree) {
    var name = getVariableName(tree);
    if (!this.imports[name]) {
      return;
    }

    var binding = this.scope.getBinding(tree);
    if (binding && isImportBinding(binding)) {
      delete this.imports[name];
    }
  }
}

export function findUnusedImports(filename, content) {
  var options = {filename};
  var {tree, errors} = new Compiler().stringToTree({content, options});

  var reporter = new CollectingErrorReporter();
  var builder = new ImportAndScopeChainBuilder(reporter);
  builder.visitAny(tree);

  var filter = new FilterFoundImports(builder, builder.imports);
  filter.visitAny(tree);

  return Object.keys(filter.imports).map((name) => {
    return {name, location: filter.imports[name].location};
  });
}

export function main(fs) {
  if (process.argv.length < 3) {
    console.error('Usage: node find-unused-imports pahts...')
    return 1;
  }

  var code = 0;
  for (var i = 2; i < process.argv.length; i++) {
    var path = process.argv[i];
    var content = fs.readFileSync(path, 'utf-8');

    var unusedImports = findUnusedImports(path, content);
    if (unusedImports.length) {
      unusedImports.forEach((imp) => {
        console.error(`${imp.location.start}: Unused import: ${imp.name}`);
      });
      code = 1;
    }
  }
  return code;
}
