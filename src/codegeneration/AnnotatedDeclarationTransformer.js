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
import {AnnotatedClassTransformer} from './AnnotatedClassTransformer';
import {AnnotatedFunctionTransformer} from './AnnotatedFunctionTransformer';
import {
  CLASS_DECLARATION,
  FUNCTION_DECLARATION
} from '../syntax/trees/ParseTreeType';

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
export class AnnotatedDeclarationTransformer extends ParseTreeTransformer {
  transformAnnotatedDeclaration(tree) {
    switch (tree.declaration.type) {
      case CLASS_DECLARATION:
        tree = this.transformClassDeclaration(tree.declaration,
            tree.annotations);
        break;
      case FUNCTION_DECLARATION:
        tree = this.transformFunctionDeclaration(tree.declaration,
            tree.annotations);
        break;
    }
    return tree;
  }

  transformClassDeclaration(tree, annotations = null) {
    return AnnotatedClassTransformer.transformTree(tree, annotations);
  }


  transformFunctionDeclaration(tree, annotations = null) {
    return AnnotatedFunctionTransformer.transformTree(tree, annotations);
  }
}
