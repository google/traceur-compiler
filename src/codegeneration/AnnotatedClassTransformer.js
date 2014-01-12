// Copyright 2014 Traceur Authors.
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

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  CONSTRUCTOR
} from '../syntax/PredefinedName';
import {
  AnonBlock,
  ClassDeclaration,
  ClassMemberMetadata,
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {
  ANNOTATED_CLASS_ELEMENT,
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR
} from '../syntax/trees/ParseTreeType';
import {propName} from '../staticsemantics/PropName';
import {MetadataTransformer} from './MetadataTransformer';

/**
 * Annotation extension
 *
 */
export class AnnotatedClassTransformer extends ParseTreeTransformer {
  /**
   * @param {Array.<ParseTree>} annotations
   */
  constructor(annotations) {
    this.annotations = annotations;
  }

  transformClassDeclaration(tree) {
    var {
      transformedClass,
      metadataStatements
    } = this.transformClass_(tree, this.annotations);

    if (metadataStatements.length > 0)
      return new AnonBlock(null, [transformedClass, ...metadataStatements]);

    return transformedClass;
  }

  transformClass_(declaration, classAnnotations) {
    var metadataList = [], metadataStatements = [], classParameters = [];
    var elementsChanged = false;

    if (classAnnotations === null)
      classAnnotations = [];

    var elements = declaration.elements.map((element) => {
      var {
        transformedElement,
        metadata,
        constructorAnnotations,
        constructorParameters
      } = this.transformClassElement_(element, declaration.name);

      if (transformedElement !== element)
        elementsChanged = true;

      if (metadata)
        metadataList.push(metadata)

      // Constructor annotations end up getting merged with the top-level class
      // annotations since the resulting transformation is a single function.
      if (constructorAnnotations)
        classAnnotations.push(...constructorAnnotations);

      if (constructorParameters)
        classParameters = constructorParameters;

      return transformedElement;
    });

    metadataList.unshift(new FunctionMetadata(null, declaration.name,
        classAnnotations, classParameters));
    metadataList.forEach((meta) => {
      var transformedMetadata = MetadataTransformer.transformTree(meta);
      metadataStatements.push(...transformedMetadata.statements);
    });

    if (elementsChanged)
      declaration = new ClassDeclaration(declaration.location, declaration.name,
          declaration.superClass, elements);

    return {
      metadataStatements,
      transformedClass: declaration
    };
  }


  transformClassElement_(tree, className, metadata) {
    var constructorAnnotations, constructorParameters, metadata;
    var annotations = [];

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
            tree.isStatic, false, false, annotations,
            tree.formalParameterList.parameters);
        }
        break;

      default:
        throw new Error(`Unexpected class element: ${tree.type}`);
    }

    return {
      metadata,
      constructorAnnotations,
      constructorParameters,
      transformedElement: tree
    };
  }

  /**
   * @param {ClassDeclaration} tree
   * @Param {Array.<ParseTree>} annotations
   */
  static transformTree(tree, annotations) {
    return new AnnotatedClassTransformer(annotations).transformAny(tree);
  }
}
