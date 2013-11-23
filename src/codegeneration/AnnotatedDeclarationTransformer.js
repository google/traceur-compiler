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
  CONSTRUCTOR
} from '../syntax/PredefinedName.js';
import {
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {
  ANNOTATED_CLASS_ELEMENT,
  CLASS_DECLARATION,
  EXPORT_DECLARATION,
  FUNCTION_DECLARATION
} from '../syntax/trees/ParseTreeType';
import {
  createObjectLiteralExpression,
  createPropertyNameAssignment,
  createScript
} from './ParseTreeFactory.js';
import {propName} from '../staticsemantics/PropName';

/**
 * Annotation extension  
 *
 */
export class AnnotatedDeclarationTransformer extends ParseTreeTransformer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.reporter_ = reporter;
  }

  transformAnnotatedDeclaration(tree) {    
    var declaration = tree.declaration;
    var annotations = tree.annotations;
    var contextExpression, ctor, parameters = [];

    if (declaration.type === EXPORT_DECLARATION) {
      declaration = tree.declaration.declaration;
    }
    
    if (declaration.type === CLASS_DECLARATION) {
      ctor = this.findConstructor_(declaration);

      if (ctor) { 
        if (ctor.type === ANNOTATED_CLASS_ELEMENT) {
          annotations = annotations.concat(ctor.annotations);
          ctor = ctor.element;
        }
        parameters = ctor.formalParameterList;
      }      
    } else if (declaration.type === FUNCTION_DECLARATION) {
      parameters = declaration.formalParameterList;
    }

    return createScript([declaration, 
      new FunctionMetadata(null, declaration.name, annotations, parameters)]);
  }

  findConstructor_(declaration) {
    var tree;

    for (tree of declaration.elements) {
      if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
        return tree;
      }
    }

    return null;
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(reporter, tree) {
    return new AnnotatedDeclarationTransformer(reporter).transformAny(tree);
  }
}