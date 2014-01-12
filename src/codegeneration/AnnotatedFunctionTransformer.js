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
  AnonBlock,
  ExportDeclaration,
  FormalParameter,
  FunctionDeclaration,
  FunctionMetadata
} from '../syntax/trees/ParseTrees';
import {EXPORT_DECLARATION} from '../syntax/trees/ParseTreeType';
import {MetadataTransformer} from './MetadataTransformer';

/**
 * Annotation extension
 *
 * This transforms function annotations into function metadata.  The metadata is
 * stored as an array in one of two properties, either "annotations" or
 * "parameters".  Each annotation stored is constructed and any parameters
 * specified on the annotation are passed to the annotation's constructor.
 *
 * Annotations on the function are stored as an "annotations" array property
 * on the function.
 *
 * Annotations on parameters are stored in the "parameters" array on the
 * function.  The parameters metadata array is a two dimensional array where
 * each entry is an array of metadata for each parameter in the method
 * declaration.  If the parameter is typed then the first entry in its
 * corresponding metadata will be the type followed by any annotations.
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
export class AnnotatedFunctionTransformer extends ParseTreeTransformer {
  transformAnnotatedFunctionDeclaration(tree) {
    var declaration = tree.declaration;
    var statements = [tree.declaration];

    if (declaration.type === EXPORT_DECLARATION)
      declaration = tree.declaration.declaration;

    var {
      transformedFunction,
      metadataStatements
    } = this.transformFunction_(declaration, tree.annotations);

    if (declaration.type === EXPORT_DECLARATION &&
        transformedFunction !== declaration)
      transformedFunction = new ExportDeclaration(tree.location,
          transformedFunction)

    if (metadataStatements.length > 0)
      return new AnonBlock(null,
          [transformedFunction].concat(metadataStatements));

    return transformedFunction;
  }

  transformFunctionDeclaration(tree) {
    var {
      transformedFunction,
      metadataStatements
    } = this.transformFunction_(tree, []);

    if (metadataStatements.length > 0)
      return new AnonBlock(null,
          [transformedFunction].concat(metadataStatements));

    return transformedFunction;
  }

  transformFormalParameter(tree) {
    if (tree.annotations.length > 0)
      return new FormalParameter(tree.location, tree.parameter,
          tree.typeAnnotation, []);
    return tree;
  }

  transformFunction_(tree, annotations) {
    var transformedMetadata = MetadataTransformer.transformTree(
        new FunctionMetadata(null,
            tree.name, annotations,
            tree.formalParameterList.parameters));

    var formalParameters = super.transformList(tree.formalParameterList);
    if (formalParameters !== tree.formalParameterList)
      tree = new FunctionDeclaration(tree.location, tree.name, tree.isGenerator,
          formalParameters, tree.typeAnnotation, tree.functionBody);

    return {
      transformedFunction: tree,
      metadataStatements: transformedMetadata.statements
    };
  }
}