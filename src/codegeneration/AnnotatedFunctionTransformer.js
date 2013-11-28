// Copyright 2012 Traceur Authors.
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

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {
  EXPORT_DECLARATION,
} from '../syntax/trees/ParseTreeType';
import {
  createScript
} from './ParseTreeFactory.js';

/**
 * Annotation extension
 *
 */
export class AnnotatedFunctionTransformer extends ParseTreeTransformer {
  transformAnnotatedFunctionDeclaration(tree) {
    var declaration = tree.declaration;
    var annotations = tree.annotations;

    if (declaration.type === EXPORT_DECLARATION) {
      declaration = tree.declaration.declaration;
    }

    return createScript([tree.declaration,
      new FunctionMetadata(null, declaration.name, annotations, declaration.formalParameterList.parameters)]);
  }
}