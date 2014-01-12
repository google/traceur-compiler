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
import {AnonBlock} from '../syntax/trees/ParseTrees';
import {
  BINDING_IDENTIFIER,
  IDENTIFIER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {
  createArgumentList,
  createArrayLiteralExpression,
  createAssignmentStatement,
  createIdentifierExpression,
  createMemberExpression,
  createNewExpression,
  createStatementList,
  createStringLiteral
} from './ParseTreeFactory';
import {parseExpression} from './PlaceholderParser';

/**
 * Annotations extension
 *
 */
export class MetadataTransformer extends ParseTreeTransformer {
  constructor() {
    super();
  }

  transformClassMemberMetadata(tree) {
    return this.transformMetadata_(this.transformClassMemberTarget_(tree),
        tree.annotations, tree.parameters);
  }

  transformFunctionMetadata(tree) {
    return this.transformMetadata_(tree.name, tree.annotations,
        tree.parameters);
  }

  transformClassReference_(tree) {
    var parent = this.createIdentifier_(tree.className);

    if (!tree.isStatic)
      parent = createMemberExpression(parent, 'prototype');
    return parent;
  }

  transformClassMemberTarget_(tree) {
    if (tree.isGetAccessor)
      return this.transformAccessor_(tree, 'get');
    else if (tree.isSetAccessor)
      return this.transformAccessor_(tree, 'set');

    return createMemberExpression(this.transformClassReference_(tree),
        tree.name.literalToken);
  }

  transformAccessor_(tree, accessor) {
    var args = createArgumentList([this.transformClassReference_(tree),
        createStringLiteral(tree.name.literalToken.value)]);

    var descriptor = parseExpression `Object.getOwnPropertyDescriptor(${args})`;
    return createMemberExpression(descriptor, accessor);
  }

  transformAnnotations_(target, annotations) {
    annotations = annotations.map((annotation) => {
      return createNewExpression(annotation.name, annotation.args);
    });

    return annotations;
  }

  transformParameters_(target, parameters) {
    var hasParameterMetadata = false;

    parameters = parameters.map((param) => {
      var metadata = [];
      if (param.typeAnnotation)
        metadata.push(this.createIdentifier_(param.typeAnnotation.name.value));

      if (param.annotations && param.annotations.length > 0)
        metadata.push.apply(metadata,
            this.transformAnnotations_(target, param.annotations));

      if (metadata.length > 0) {
        hasParameterMetadata = true;
        return createArrayLiteralExpression(metadata);
      }
      return createArrayLiteralExpression([]);
    });

    return hasParameterMetadata ? parameters : [];
  }

  transformMetadata_(target, annotations, parameters) {
    var statements = [];

    if (annotations) {
      annotations = this.transformAnnotations_(target, annotations);

      if (annotations.length > 0) {
        statements.push(createAssignmentStatement(
            createMemberExpression(this.createIdentifier_(target), 'annotations'),
            createArrayLiteralExpression(annotations)));
      }
    }

    if (parameters) {
      parameters = this.transformParameters_(target, parameters);

      if (parameters.length > 0) {
        statements.push(createAssignmentStatement(
            createMemberExpression(this.createIdentifier_(target), 'parameters'),
            createArrayLiteralExpression(parameters)));
      }
    }

    return new AnonBlock(null, statements);
  }

  createIdentifier_(tree) {
    if (typeof tree == 'string')
      tree = createIdentifierExpression(tree);
    else if (tree.type === BINDING_IDENTIFIER)
      tree = createIdentifierExpression(tree.identifierToken);
    return tree;
  }

  static transformTree(tree) {
    return new MetadataTransformer().transformAny(tree);
  }
}