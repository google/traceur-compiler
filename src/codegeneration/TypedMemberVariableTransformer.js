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

import {
  AnonBlock,
  ClassDeclaration,
  ClassExpression
} from '../syntax/trees/ParseTrees.js';
import {PROPERTY_VARIABLE_DECLARATION} from '../syntax/trees/ParseTreeType.js';
import {parsePropertyDefinition} from './PlaceholderParser.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';

/**
 * Transform member variable declarations from:
 *
 * class Test {
 *   a:string;
 *   static b:number;
 *   c;
 * }
 *
 * to:
 *
 * class Test {
 *   get a() {
 *     return this.$__0;
 *   }
 *
 *   set a(value:string) {
 *     this.$__0 = value;
 *   }
 *
 *   static get b() {
 *     return this.$__1;
 *   }
 *
 *   static set b(value: number) {
 *     this.$__1 = value;
 *   }
 *
 *   get c() {
 *     return this.$__2;
 *   }
 *
 *   set c(value) {
 *     this.$__2 = value;
 *   }
 * }
 */
export class TypedMemberVariableTransformer extends ParseTreeTransformer{
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super();
    this.identifierGenerator_ = identifierGenerator;
  }

  transformPropertyVariableDeclaration(tree) {
    let identifier = this.identifierGenerator_.generateUniqueIdentifier();
    let getter = this.createGetAccessor_(identifier, tree);
    let setter = this.createSetAccessor_(identifier, tree);
    return new AnonBlock(tree.location, [getter, setter, tree]);
  }

  createGetAccessor_(identifier, tree) {
    let name = tree.name.literalToken;
    let type = tree.typeAnnotation;
    let def = parsePropertyDefinition `get ${name}():${type}
      { return this.${identifier}; }`;
    // Ok to mutate the tree before it's being published
    def.isStatic = tree.isStatic;
    return def;
  }

  createSetAccessor_(identifier, tree) {
    let name = tree.name.literalToken;
    let type = tree.typeAnnotation;
    let def = parsePropertyDefinition `set ${name}(value:${type})
      { this.${identifier} = value; }`;
    // Ok to mutate the tree before it's being published
    def.isStatic = tree.isStatic;
    return def;
  }
}
