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
  ClassMemberMetadata,
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {
  ANNOTATED_CLASS_ELEMENT,
  EXPORT_DECLARATION,
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR
} from '../syntax/trees/ParseTreeType';
import {
  createScript
} from './ParseTreeFactory.js';
import {propName} from '../staticsemantics/PropName';

/**
 * Annotation extension
 *
 */
export class AnnotatedClassTransformer extends ParseTreeTransformer {
  transformAnnotatedClassDeclaration(tree) {
    var declaration = tree.declaration;
    var elements = [], metadata = [], classParameters = [], classAnnotations = [];

    classAnnotations = tree.annotations;

    if (declaration.type === EXPORT_DECLARATION) {
      declaration = tree.declaration.declaration;
    }

    declaration.elements.forEach((tree) => {
      var result = this.transformClassElement_(tree, declaration.name);
      elements.push(result.element);

      if (result.metadata)
        metadata.push(result.metadata)

      if (result.constructorAnnotations)
        classAnnotations = classAnnotations.concat(result.constructorAnnotations);

      if (result.constructorParameters)
        classParameters = result.constructorParameters;
    });

    declaration.elements = elements;
    metadata.unshift(new FunctionMetadata(null, declaration.name, classAnnotations, classParameters));
    return createScript([tree.declaration].concat(metadata));
  }


  transformClassElement_(tree, className, metadata) {
    var annotations = [], constructorAnnotations, constructorParameters, metadata;

    if (tree.type === ANNOTATED_CLASS_ELEMENT) {
      annotations = tree.annotations;
      tree = tree.element;
    }

    switch (tree.type) {
      case GET_ACCESSOR:
        metadata = new ClassMemberMetadata(null, tree.name, className,
          tree.isStatic, true, false, annotations, []);
        break;

      case SET_ACCESSOR:
        metadata = new ClassMemberMetadata(null, tree.name, className,
          tree.isStatic, false, true, annotations, [tree.parameter]);
        break;

      case PROPERTY_METHOD_ASSIGNMENT:
        if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
          constructorAnnotations = annotations;
          constructorParameters = tree.formalParameterList.parameters;
        } else {
          metadata = new ClassMemberMetadata(null, tree.name, className,
            tree.isStatic, false, false, annotations, tree.formalParameterList.parameters);
        }
        break;

      default:
        throw new Error(`Unexpected class element: ${tree.type}`);
    }

    return {
      element: tree,
      metadata: metadata,
      constructorAnnotations: constructorAnnotations,
      constructorParameters: constructorParameters
    };
  }
}