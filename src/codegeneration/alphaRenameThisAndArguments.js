// Copyright 2013 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strong';

import {
  ARGUMENTS,
  THIS
} from '../syntax/PredefinedName.js';
import {AlphaRenamer} from './AlphaRenamer.js';
import {FindInFunctionScope} from './FindInFunctionScope.js';

/**
 * This is used to find whether a function contains a reference to 'this' or
 * 'arguments'.
 */
class FindThisOrArguments extends FindInFunctionScope {
  constructor() {
    super();
    this.foundThis = false;
    this.foundArguments = false;
  }
  visitThisExpression(tree) {
    this.foundThis = true;
    this.found = this.foundArguments;
  }
  visitIdentifierExpression(tree) {
    if (tree.identifierToken.value === ARGUMENTS) {
      this.foundArguments = true;
      this.found = this.foundThis;
    }
  }
}

export default function alphaRenameThisAndArguments(tempVarTransformer, tree) {
  var finder = new FindThisOrArguments();
  finder.visitAny(tree);
  if (finder.foundArguments) {
    var argumentsTempName = tempVarTransformer.addTempVarForArguments();
    tree = AlphaRenamer.rename(tree, ARGUMENTS, argumentsTempName);
  }
  if (finder.foundThis) {
    var thisTempName = tempVarTransformer.addTempVarForThis();
    tree = AlphaRenamer.rename(tree, THIS, thisTempName);
  }
  return tree;
}
