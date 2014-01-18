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
  AnonBlock,
  FormalParameter,
  FunctionDeclaration,
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {MetadataTransformer} from './MetadataTransformer';

/**
 * Annotation extension
 *
 */
export class AnnotatedFunctionTransformer extends ParseTreeTransformer {
  /**
   * @param {Array.<ParseTree>} annotations
   */
  constructor(annotations) {
    this.annotations = annotations;
  }

  transformFunctionDeclaration(tree) {
    var {
      transformedFunction,
      metadataStatements
    } = this.transformFunction_(tree, this.annotations);

    if (metadataStatements.length > 0) {
      return new AnonBlock(null,
          [transformedFunction, ...metadataStatements]);
    }

    return transformedFunction;
  }

  transformFormalParameter(tree) {
    if (tree.annotations.length > 0) {
      return new FormalParameter(tree.location, tree.parameter,
          tree.typeAnnotation, []);
    }
    return tree;
  }

  transformFunction_(tree, annotations) {
    var transformedMetadata = MetadataTransformer.transformTree(
        new FunctionMetadata(null,
            tree.name, annotations,
            tree.formalParameterList.parameters));

    var formalParameters = super.transformList(tree.formalParameterList);
    if (formalParameters !== tree.formalParameterList) {
      tree = new FunctionDeclaration(tree.location, tree.name, tree.isGenerator,
          formalParameters, tree.typeAnnotation, tree.functionBody);
    }

    return {
      transformedFunction: tree,
      metadataStatements: transformedMetadata.statements
    };
  }

  /**
   * @param {FunctionDeclaration} tree
   * @Param {Array.<ParseTree>} annotations
   */
  static transformTree(tree, annotations) {
    return new AnnotatedFunctionTransformer(annotations).transformAny(tree);
  }
}
