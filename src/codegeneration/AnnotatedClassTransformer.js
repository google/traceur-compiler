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

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  CONSTRUCTOR
} from '../syntax/PredefinedName';
import {
  AnonBlock,
  ClassDeclaration,
  ClassMemberMetadata,
  ExportDeclaration,
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {
  ANNOTATED_CLASS_ELEMENT,
  EXPORT_DECLARATION,
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR
} from '../syntax/trees/ParseTreeType';
import {propName} from '../staticsemantics/PropName';
import {MetadataTransformer} from './MetadataTransformer';

/**
 * Annotation extension
 *
 * This transforms class annotations into class metadata.  The metadata is
 * stored as an array in one of two properties, either "annotations" or
 * "parameters".  Each annotation stored is constructed and any parameters
 * specified on the annotation are passed to the annotation's constructor.
 *
 * Annotations on a class, method, or accessor are stored in the "annotations"
 * array on the corresponding element.
 *
 * Annotations on parameters are stored in the "parameters" array on the parent
 * element.  The parameters metadata array is a two dimensional array where
 * each entry is an array of metadata for each parameter in the method
 * declaration.  If the parameter is typed then the first entry in its
 * corresponding metadata will be the type followed by any annotations.
 *
 *   @A
 *   class B {
 *     constructor(@A x:T) {
 *       super();
 *     }
 *     @A
 *     method(@A x:T) {
 *     }
 *   }
 *
 *   =>
 *
 *    var B = function(x) {
 *      "use strict";
 *      $traceurRuntime.superCall(this, $B.prototype, "constructor", []);
 *    };
 *    var $B = ($traceurRuntime.createClass)(B, {method: function(x) {
 *        "use strict";
 *      }}, {});
 *    B.annotations = [new A];
 *    B.parameters = [[T, new A]];
 *    B.prototype.method.annotations = [new A];
 *    B.prototype.method.parameters = [[T, new A]];
 */
export class AnnotatedClassTransformer extends ParseTreeTransformer {
  transformAnnotatedClassDeclaration(tree) {
    var declaration = tree.declaration;

    if (declaration.type === EXPORT_DECLARATION)
      declaration = tree.declaration.declaration;

    var {
      transformedClass,
      metadataStatements
    } = this.transformClass_(declaration, tree.annotations);

    if (declaration.type === EXPORT_DECLARATION &&
        transformedClass !== declaration)
      transformedClass = new ExportDeclaration(tree.location, transformedClass);

    if (metadataStatements.length > 0)
      return new AnonBlock(null, [transformedClass].concat(metadataStatements));

    return transformedClass;
  }

  transformClassDeclaration(tree) {
    var {
      transformedClass,
      metadataStatements
    } = this.transformClass_(tree, []);

    if (metadataStatements.length > 0)
      return new AnonBlock(null, [transformedClass].concat(metadataStatements));

    return transformedClass;
  }

  transformClass_(declaration, classAnnotations) {
    var metadataList = [], metadataStatements = [];
    var classParameters = [], elements = [];
    var elementsChanged = false;

    declaration.elements.forEach((element) => {
      var {
        transformedElement,
        metadata,
        constructorAnnotations,
        constructorParameters
      } = this.transformClassElement_(element, declaration.name);

      elements.push(transformedElement);

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
}