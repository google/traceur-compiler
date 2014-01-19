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
  IDENTIFIER,
  STRING
} from '../syntax/TokenType';
import {
  AnonBlock,
  ClassDeclaration,
  ExportDeclaration,
  FormalParameter,
  FunctionDeclaration,
  GetAccessor,
  LiteralExpression,
  PropertyMethodAssignment,
  SetAccessor
} from '../syntax/trees/ParseTrees';
import {
  BINDING_IDENTIFIER,
  IDENTIFIER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {propName} from '../staticsemantics/PropName';
import {
  createArgumentList,
  createArrayLiteralExpression,
  createAssignmentStatement,
  createIdentifierExpression,
  createMemberExpression,
  createNewExpression,
  createStatementList,
  createStringLiteralToken
} from './ParseTreeFactory';
import {parseExpression} from './PlaceholderParser';

class AnnotationsScope {
  constructor() {
    this.className = null;
    this.constructorParameters = [];
    this.annotations = [];
    this.metadata = [];
  }
}

/**
 * Annotation extension
 *
 * This transforms annotations into metadata properties.  The metadata is
 * stored as an array in one of two properties, either "annotations" or
 * "parameters".  Each annotation stored is constructed and any parameters
 * specified on the annotation are passed to the annotation's constructor.
 *
 * Annotations on a function, class, method, or accessor are stored in the
 * "annotations", array on the corresponding element.
 *
 * Annotations on parameters are stored in the "parameters" array on the parent
 * element.  The parameters metadata array is a two dimensional array where
 * each entry is an array of metadata for each parameter in the method
 * declaration.  If the parameter is typed then the first entry in its
 * corresponding metadata will be the type followed by any annotations.
 *
 * Class example:
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
 *
 * Function example:
 *
 *   @A
 *   function b(@A c:T, d:T) {}
 *
 *   =>
 *
 *    function b(c, d) {}
 *    b.annotations = [new A];
 *    b.parameters = [[T, new A], [T]];
 */
 export class AnnotationsTransformer extends ParseTreeTransformer {
  constructor() {
    this.stack_ = [new AnnotationsScope()];
  }

  transformExportDeclaration(tree) {
    var declaration;

    this.stack_.push(new AnnotationsScope());
    this.scope.annotations.push(...tree.annotations);
    declaration = this.transformAny(tree.declaration);

    if (declaration !== tree.declaration)
      tree = new ExportDeclaration(tree.location, declaration, []);

    return this.appendMetadata_(tree, this.stack_.pop().metadata);
  }

  transformClassDeclaration(tree) {
    var elementsChanged = false;
    var annotations = this.scope.annotations;
    this.stack_.push(new AnnotationsScope());
    this.scope.className = tree.name;
    this.scope.annotations.push(...annotations);
    this.scope.annotations.push(...tree.annotations);

    var elements = tree.elements.map((element) => {
      var transformedElement = this.transformAny(element);

      if (transformedElement !== element)
        elementsChanged = true;

      return transformedElement;
    });

    this.scope.metadata.unshift(...this.transformMetadata_(
        tree.name,
        this.scope.annotations,
        this.scope.constructorParameters));

    if (elementsChanged || tree.annotations.length > 0) {
      tree = new ClassDeclaration(tree.location, tree.name,
          tree.superClass, elements, []);
    }

    return this.appendMetadata_(tree, this.stack_.pop().metadata);
  }

  transformFunctionDeclaration(tree) {
    var annotations = this.scope.annotations;
    this.stack_.push(new AnnotationsScope());
    this.scope.annotations.push(...annotations);
    this.scope.annotations.push(...tree.annotations);

    this.scope.metadata.push(...this.transformMetadata_(tree.name,
        this.scope.annotations,
        tree.formalParameterList.parameters));

    var formalParameters = super.transformList(tree.formalParameterList);
    if (formalParameters !== tree.formalParameterList ||
        tree.annotations.length > 0) {
      tree = new FunctionDeclaration(tree.location, tree.name, tree.isGenerator,
          formalParameters, tree.typeAnnotation, [], tree.functionBody);
    }

    return this.appendMetadata_(tree, this.stack_.pop().metadata);
  }

  transformFormalParameter(tree) {
    if (tree.annotations.length > 0) {
      return new FormalParameter(tree.location, tree.parameter,
          tree.typeAnnotation, []);
    }
    return tree;
  }

  transformGetAccessor(tree) {
    // We only want to process if we're within a class scope
    if (this.scope.className === null) {
      return tree;
    }

    this.scope.metadata.push(...this.transformMetadata_(
        this.transformAccessor_(tree, this.scope.className, 'get'),
        tree.annotations,
        []));

    if (tree.annotations.length > 0) {
      tree = new GetAccessor(tree.location, tree.isStatic, tree.name,
          tree.typeAnnotation, [], tree.body);
    }
    return tree;
  }

  transformSetAccessor(tree) {
    // We only want to process if we're within a class scope
    if (this.scope.className === null) {
      return tree;
    }

    this.scope.metadata.push(...this.transformMetadata_(
        this.transformAccessor_(tree, this.scope.className, 'set'),
        tree.annotations,
        [tree.parameter]));

    if (tree.annotations.length > 0) {
      tree = new SetAccessor(tree.location, tree.isStatic, tree.name,
          tree.parameter, [], tree.body);
    }
    return tree;
  }

  transformPropertyMethodAssignment(tree) {
    // We only want to process if we're within a class scope
    if (this.scope.className === null) {
      return tree;
    }

    if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
      this.scope.annotations.push(...tree.annotations);
      this.scope.constructorParameters = tree.formalParameterList.parameters;
    } else {
      this.scope.metadata.push(...this.transformMetadata_(
          this.transformPropertyMethod_(tree, this.scope.className),
          tree.annotations,
          tree.formalParameterList.parameters));
    }

    if (tree.annotations.length > 0) {
      tree = new PropertyMethodAssignment(tree.location, tree.isStatic,
          tree.isGenerator, tree.name, tree.formalParameterList,
          tree.typeAnnotation, [], tree.functionBody);
    }
    return tree;
  }

  appendMetadata_(tree, metadata) {
    if (metadata.length > 0) {
      // Only return the anon block from the top of the transformation stack.
      // Otherwise we end up attaching an AnonBlock to an ExportDeclaration.
      if (this.stack_.length === 1) {
        tree = new AnonBlock(null, [tree, ...metadata]);
      } else {
        this.scope.metadata.push(...metadata);
      }
    }

    return tree;
  }

  transformClassReference_(tree, className) {
    var parent = this.createIdentifier_(className);

    if (!tree.isStatic)
      parent = createMemberExpression(parent, 'prototype');
    return parent;
  }

  transformPropertyMethod_(tree, className) {
    return createMemberExpression(this.transformClassReference_(tree, className),
                                  tree.name.literalToken);
  }

  transformAccessor_(tree, className, accessor) {
    var args = createArgumentList([this.transformClassReference_(tree, className),
        this.createLiteralStringExpression_(tree.name)]);

    var descriptor = parseExpression `Object.getOwnPropertyDescriptor(${args})`;
    return createMemberExpression(descriptor, accessor);
  }

  transformParameters_(parameters) {
    var hasParameterMetadata = false;

    parameters = parameters.map((param) => {
      var metadata = [];
      if (param.typeAnnotation)
        metadata.push(this.createIdentifier_(param.typeAnnotation.name.value));

      if (param.annotations && param.annotations.length > 0)
        metadata.push(...this.transformAnnotations_(param.annotations));

      if (metadata.length > 0) {
        hasParameterMetadata = true;
        return createArrayLiteralExpression(metadata);
      }
      return createArrayLiteralExpression([]);
    });

    return hasParameterMetadata ? parameters : [];
  }

  transformAnnotations_(annotations) {
    annotations = annotations.map((annotation) => {
      return createNewExpression(annotation.name, annotation.args);
    });

    return annotations;
  }

  transformMetadata_(target, annotations, parameters) {
    var metadataStatements = [];
    var targetIdentifier = this.createIdentifier_(target);

    if (annotations !== null) {
      annotations = this.transformAnnotations_(annotations);
      if (annotations.length > 0) {
        metadataStatements.push(createAssignmentStatement(
            createMemberExpression(targetIdentifier, 'annotations'),
            createArrayLiteralExpression(annotations)));
      }
    }

    if (parameters !== null) {
      parameters = this.transformParameters_(parameters);

      if (parameters.length > 0) {
        metadataStatements.push(createAssignmentStatement(
            createMemberExpression(targetIdentifier, 'parameters'),
            createArrayLiteralExpression(parameters)));
      }
    }
    return metadataStatements;
  }

  createLiteralStringExpression_(tree) {
    var token = tree.literalToken;
    if (tree.literalToken.type !== STRING)
      token = createStringLiteralToken(tree.literalToken.value);
    return new LiteralExpression(null, token);
  }

  createIdentifier_(tree) {
    if (typeof tree == 'string')
      tree = createIdentifierExpression(tree);
    else if (tree.type === BINDING_IDENTIFIER)
      tree = createIdentifierExpression(tree.identifierToken);
    return tree;
  }

  get scope() {
    return this.stack_[this.stack_.length - 1];
  }
}
