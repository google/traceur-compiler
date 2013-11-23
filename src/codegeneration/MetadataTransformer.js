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
  createArgumentList,
  createArrayLiteralExpression,
  createAssignmentStatement,
  createCallExpression,
  createIdentifierExpression,
  createMemberExpression,
  createNewExpression,
  createScript,
  createStatementList,
  createStringLiteral
} from './ParseTreeFactory.js';

/**
 * Annotations extension
 *
 */
export class MetadataTransformer extends ParseTreeTransformer {
  /**
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   */
  constructor(runtimeInliner, reporter) {
    super();
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
  }

  transformClassMemberMetadata(tree) {
    return this.transformMetadata_(this.transformClassMemberTarget_(tree),
      tree.annotations, tree.parameters);
  }

  transformFunctionMetadata(tree) {
    return this.transformMetadata_(tree.name, tree.annotations, tree.parameters);
  }

  get getPropertyDescriptor() {
    return this.runtimeInliner_.get('getPropertyDescriptor');
  }

  transformClassReference_(tree) {
    var parent = tree.className;

    if (!tree.isStatic) {
      parent = createMemberExpression(parent, 'prototype');
    }
    return parent;
  }

  transformClassMemberTarget_(tree) {
    if (tree.isGetAccessor) {
      return this.transformAccessor_(tree, 'get');
    } else if (tree.isSetAccessor) {
      return this.transformAccessor_(tree, 'set');
    }
    return createMemberExpression(this.transformClassReference_(tree), tree.name.literalToken);
  }

  transformAccessor_(tree, accessor) {
    var descriptor = createCallExpression(this.getPropertyDescriptor,
      createArgumentList([this.transformClassReference_(tree),
        createStringLiteral(tree.name.literalToken.value)]));

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
      if (param.annotations && param.annotations.length > 0) {
        hasParameterMetadata = true;
        return createArrayLiteralExpression(this.transformAnnotations_(target, param.annotations));
      }
      return [];
    });

    return hasParameterMetadata ? parameters : [];
  }

  transformMetadata_(target, annotations, parameters) {
    var statements = [];

    if (annotations) {
      annotations = this.transformAnnotations_(target, annotations);

      if (annotations.length > 0) {
        statements.push(createAssignmentStatement(createMemberExpression(target, 'annotations'),
          createArrayLiteralExpression(annotations)));
      }
    }

    if (parameters) {
      parameters = this.transformParameters_(target, parameters);

      if (parameters.length > 0) {
        statements.push(createAssignmentStatement(createMemberExpression(target, 'parameters'),
          createArrayLiteralExpression(parameters)));
      }
    }

    return createScript(createStatementList(statements));
  }

  /**
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(runtimeInliner, reporter, tree) {
    return new MetadataTransformer(runtimeInliner, reporter).transformAny(tree);
  }
}