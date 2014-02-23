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
  BindingIdentifier,
  BreakStatement,
  ContinueStatement,
  DebuggerStatement,
  EmptyStatement,
  ExportSpecifier,
  ExportStar,
  IdentifierExpression,
  ImportSpecifier,
  LiteralExpression,
  ModuleSpecifier,
  PredefinedType,
  PropertyNameShorthand,
  TemplateLiteralPortion,
  RestParameter,
  SuperExpression,
  ThisExpression 
} from '../syntax/trees/ParseTrees';

/**
 * Duplicates a ParseTree. Simply creates new leaf nodes so the
 * ParseTreeTransformer branch methods all see changes values and
 * thus create new branch nodes. 
 */
export class CloneTreeTransformer extends ParseTreeTransformer {

  /**
   * @param {BindingIdentifier} tree
   * @return {ParseTree}
   */
  transformBindingIdentifier(tree) {
    return new BindingIdentifier(tree.metadata, tree.identifierToken);
  }

  /**
   * @param {BreakStatement} tree
   * @return {ParseTree}
   */
  transformBreakStatement(tree) {
    return new BreakStatement(tree.metadata, tree.name);
  }

  /**
   * @param {ContinueStatement} tree
   * @return {ParseTree}
   */
  transformContinueStatement(tree) {
    return new ContinueStatement(tree.metadata, tree.name);
  }

  /**
   * @param {DebuggerStatement} tree
   * @return {ParseTree}
   */
  transformDebuggerStatement(tree) {
    return new DebuggerStatement(tree.metadata);
  }

  /**
   * @param {EmptyStatement} tree
   * @return {ParseTree}
   */
  transformEmptyStatement(tree) {
    return new EmptyStatement(tree.metadata);
  }

  /**
   * @param {ExportSpecifier} tree
   * @return {ParseTree}
   */
  transformExportSpecifier(tree) {
    return new ExportSpecifier(tree.metadata, tree.lhs, tree.rhs);
  }

  /**
   * @param {ExportStar} tree
   * @return {ParseTree}
   */
  transformExportStar(tree) {
    return new ExportStar(tree.metadata);
  }

  /**
   * @param {IdentifierExpression} tree
   * @return {ParseTree}
   */
  transformIdentifierExpression(tree) {
    return new IdentifierExpression(tree.metadata, tree.identifierToken);
  }

  /**
   * @param {ImportSpecifier} tree
   * @return {ParseTree}
   */
  transformImportSpecifier(tree) {
    return new ImportSpecifier(tree.metadata, tree.lhs, tree.rhs);
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {Array.<ParseTree>}
   */
  transformList(list) {
    if (!list) {
      return null;
    } else if (list.length == 0) {
      return [];
    } else {
      return super.transformList(list);
    }
  }

  /**
   * @param {LiteralExpression} tree
   * @return {ParseTree}
   */
  transformLiteralExpression(tree) {
    return new LiteralExpression(tree.metadata, tree.literalToken);
  }

  /**
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    return new ModuleSpecifier(tree.metadata, tree.token);
  }

  /**
   * @param {PredefinedType} tree
   * @return {ParseTree}
   */
  transformPredefinedType(tree) {
    return new PredefinedType(tree.metadata, tree.typeToken);
  }

  /**
   * @param {PropertyNameShorthand} tree
   * @return {ParseTree}
   */
  transformPropertyNameShorthand(tree) {
    return new PropertyNameShorthand(tree.metadata, tree.name);
  }

  /**
   * @param {TemplateLiteralPortion} tree
   * @return {ParseTree}
   */
  transformTemplateLiteralPortion(tree) {
    return new TemplateLiteralPortion(tree.metadata, tree.value);
  }

  /**
   * @param {SuperExpression} tree
   * @return {ParseTree}
   */
  transformSuperExpression(tree) {
    return new SuperExpression(tree.metadata);
  }

  /**
   * @param {ThisExpression} tree
   * @return {ParseTree}
   */
  transformThisExpression(tree) {
    return new ThisExpression(tree.metadata);
  }
}

CloneTreeTransformer.cloneTree = function(tree) {
  return new CloneTreeTransformer().transformAny(tree);
};
