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
    this.isExport = false;
    this.constructorParameters = [];
    this.annotations = [];
    this.metadata = [];
  }

  get inClassScope() {
    return this.className !== null;
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
    var scope = this.pushAnnotationScope_();
    scope.isExport = true;
    scope.annotations.push(...tree.annotations);
    var declaration = this.transformAny(tree.declaration);
    if (declaration !== tree.declaration || tree.annotations.length > 0)
      tree = new ExportDeclaration(tree.location, declaration, []);
    return this.appendMetadata_(tree);
  }

  transformClassDeclaration(tree) {
    var elementsChanged = false;
    var exportAnnotations = this.scope.isExport ? this.scope.annotations : [];
    var scope = this.pushAnnotationScope_();
    scope.className = tree.name;
    scope.annotations.push(...exportAnnotations, ...tree.annotations);

    // we need to recurse to collect the constructor metadata before
    // we process the class metadata
    tree = super(tree);
    scope.metadata.unshift(...this.transformMetadata_(
        createIdentifierExpression(tree.name),
        scope.annotations,
        scope.constructorParameters));

    if (tree.annotations.length > 0) {
      tree = new ClassDeclaration(tree.location, tree.name,
          tree.superClass, tree.elements, []);
    }
    return this.appendMetadata_(tree);
  }

  transformFunctionDeclaration(tree) {
    var exportAnnotations = this.scope.isExport ? this.scope.annotations : [];
    var scope = this.pushAnnotationScope_();
    scope.annotations.push(...exportAnnotations, ...tree.annotations);

    scope.metadata.push(...this.transformMetadata_(
        createIdentifierExpression(tree.name),
        scope.annotations,
        tree.parameterList.parameters));

    tree = super(tree);
    if (tree.annotations.length > 0) {
      tree = new FunctionDeclaration(tree.location, tree.name, tree.functionKind,
          tree.parameterList, tree.typeAnnotation, [], tree.functionBody);
    }
    return this.appendMetadata_(tree);
  }

  transformFormalParameter(tree) {
    if (tree.annotations.length > 0) {
      tree = new FormalParameter(tree.location, tree.parameter,
          tree.typeAnnotation, []);
    }
    return super(tree);
  }

  transformGetAccessor(tree) {
    if (!this.scope.inClassScope)
      return super(tree);

    this.scope.metadata.push(...this.transformMetadata_(
        this.transformAccessor_(tree, this.scope.className, 'get'),
        tree.annotations,
        []));

    if (tree.annotations.length > 0) {
      tree = new GetAccessor(tree.location, tree.isStatic, tree.name,
          tree.typeAnnotation, [], tree.body);
    }
    return super(tree);
  }

  transformSetAccessor(tree) {
    if (!this.scope.inClassScope)
      return super(tree);

    this.scope.metadata.push(...this.transformMetadata_(
        this.transformAccessor_(tree, this.scope.className, 'set'),
        tree.annotations,
        tree.parameterList.parameters));

    var parameterList = this.transformAny(tree.parameterList);
    if (parameterList !== tree.parameterList || tree.annotations.length > 0) {
      tree = new SetAccessor(tree.location, tree.isStatic, tree.name,
          parameterList, [], tree.body);
    }
    return super(tree);
  }

  transformPropertyMethodAssignment(tree) {
    if (!this.scope.inClassScope)
      return super(tree);

    if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
      this.scope.annotations.push(...tree.annotations);
      this.scope.constructorParameters = tree.parameterList.parameters;
    } else {
      this.scope.metadata.push(...this.transformMetadata_(
          this.transformPropertyMethod_(tree, this.scope.className),
          tree.annotations,
          tree.parameterList.parameters));
    }

    var parameterList = this.transformAny(tree.parameterList);
    if (parameterList !== tree.parameterList ||
        tree.annotations.length > 0) {
      tree = new PropertyMethodAssignment(tree.location, tree.isStatic,
          tree.functionKind, tree.name, parameterList,
          tree.typeAnnotation, [], tree.functionBody);
    }
    return super(tree);
  }

  appendMetadata_(tree) {
    var metadata = this.stack_.pop().metadata;
    if (metadata.length > 0) {
      if (this.scope.isExport) {
        this.scope.metadata.push(...metadata);
      } else {
        tree = new AnonBlock(null, [tree, ...metadata]);
      }
    }
    return tree;
  }

  transformClassReference_(tree, className) {
    var parent = createIdentifierExpression(className);
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
        metadata.push(this.transformAny(param.typeAnnotation));
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
    return annotations.map((annotation) => {
      return createNewExpression(annotation.name, annotation.args);
    });
  }

  transformMetadata_(target, annotations, parameters) {
    var metadataStatements = [];

    if (annotations !== null) {
      annotations = this.transformAnnotations_(annotations);
      if (annotations.length > 0) {
        metadataStatements.push(createAssignmentStatement(
            createMemberExpression(target, 'annotations'),
            createArrayLiteralExpression(annotations)));
      }
    }

    if (parameters !== null) {
      parameters = this.transformParameters_(parameters);
      if (parameters.length > 0) {
        metadataStatements.push(createAssignmentStatement(
            createMemberExpression(target, 'parameters'),
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

  get scope() {
    return this.stack_[this.stack_.length - 1];
  }

  pushAnnotationScope_() {
    var scope = new AnnotationsScope();
    this.stack_.push(scope);
    return scope;
  }
}
