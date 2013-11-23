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
  ClassDeclaration,
  FunctionDeclaration,
  ExportDeclaration
} from '../syntax/trees/ParseTrees';
import {
  CALL_EXPRESSION,
  MEMBER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {
  createEmptyStatement
} from './ParseTreeFactory.js';

/**
 * Decorator extension  
 *
 */
export class MetadataTransformer extends ParseTreeTransformer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.reporter_ = reporter;
  }

  transformClassMemberMetadata(tree) { 
    console.log(tree.toJSON());
    return createEmptyStatement();
  }

  transformFunctionMetadata(tree) { 
    console.log(tree.toJSON());
    return createEmptyStatement();
  }


  /**
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(reporter, tree) {
    return new MetadataTransformer(reporter).transformAny(tree);
  }
}