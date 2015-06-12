// Copyright 2015 Traceur Authors.
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

import {
  ArrowFunctionExpression,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessor,
  PropertyMethodAssignment,
  SetAccessor,
} from '../syntax/trees/ParseTrees.js';

export default function SkipFunctionsTransformerTrait(ParseTreeTransformer) {
  return class SkipFunctionsTransformer extends ParseTreeTransformer {
    transformFunctionDeclaration(tree) {
      let annotations = this.transformList(tree.annotations);
      if (annotations === tree.annotations) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, tree.name,
                                     tree.functionKind, tree.parameterList,
                                     tree.typeAnnotation, annotations,
                                     tree.body);
    }

    transformFunctionExpression(tree) {
      let annotations = this.transformList(tree.annotations);
      if (annotations === tree.annotations) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, tree.name,
                                     tree.functionKind, tree.parameterList,
                                     tree.typeAnnotation, annotations,
                                     tree.body);
    }

    transformSetAccessor(tree) {
      let name = this.transformAny(tree.name);
      let annotations = this.transformList(tree.annotations);
      if (name === tree.name && annotations === tree.annotations) {
        return tree;
      }
      return new SetAccessor(tree.location, tree.isStatic, name,
                             tree.parameterList, annotations, tree.body);
    }

    transformGetAccessor(tree) {
      let name = this.transformAny(tree.name);
      let annotations = this.transformList(tree.annotations);
      if (name === tree.name && annotations === tree.annotations) {
        return tree;
      }
      return new GetAccessor(tree.location, tree.isStatic, name, annotations,
                             tree.body);
    }

    transformPropertyMethodAssignment(tree) {
      let name = this.transformAny(tree.name);
      let annotations = this.transformList(tree.annotations);
      if (name === tree.name && annotations === tree.annotations) {
        return tree;
      }
      return new PropertyMethodAssignment(tree.location, tree.isStatic,
                                          tree.functionKind, name,
                                          tree.parameterList,
                                          tree.typeAnnotation, annotations,
                                          tree.body, tree.debugName);
    }

    transformArrowFunctionExpression(tree) {
      return tree;
    }
  };
}
