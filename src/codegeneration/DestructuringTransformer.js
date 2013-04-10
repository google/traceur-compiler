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

import {
  ARRAY,
  CALL,
  PROTOTYPE,
  SLICE
} from '../syntax/PredefinedName.js';
import {
  ARRAY_LITERAL_EXPRESSION,
  ARRAY_PATTERN,
  BINDING_ELEMENT,
  BLOCK,
  CALL_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  OBJECT_LITERAL_EXPRESSION,
  OBJECT_PATTERN,
  OBJECT_PATTERN_FIELD,
  PAREN_EXPRESSION,
  VARIABLE_DECLARATION_LIST
} from '../syntax/trees/ParseTreeType.js';
import {
  BindingElement,
  Catch,
  ForInStatement,
  ForOfStatement,
  FunctionDeclaration,
  FunctionExpression,
  LiteralExpression,
  SetAccessor
} from '../syntax/trees/ParseTrees.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  EQUAL,
  IDENTIFIER,
  IN,
  LET,
  VAR
} from '../syntax/TokenType.js';
import {
  createArgumentList,
  createAssignmentExpression,
  createBinaryOperator,
  createBindingIdentifier,
  createBlock,
  createCallExpression,
  createCommaExpression,
  createConditionalExpression,
  createExpressionStatement,
  createIdentifierExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createNumberLiteral,
  createOperatorToken,
  createParenExpression,
  createStringLiteral,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory.js';
import {options} from '../options.js';
import {prependStatements} from './PrependStatements.js';

var stack = [];

/**
 * Collects assignments in the desugaring of a pattern.
 */
class Desugaring {
  /**
   * @param {ParseTree} rvalue
   */
  constructor(rvalue) {
    this.rvalue = rvalue;
  }
}

/**
 * Collects assignments as assignment expressions. This is the
 * desugaring for assignment expressions.
 */
class AssignmentExpressionDesugaring extends Desugaring {
  /**
   * @param {ParseTree} rvalue
   */
  constructor(rvalue) {
    super(rvalue);
    this.expressions = [];
  }

  assign(lvalue, rvalue) {
    this.expressions.push(createAssignmentExpression(lvalue, rvalue));
  }
}

/**
 * Collects assignments as variable declarations. This is the
 * desugaring for 'var', 'const' declarations.
 */
class VariableDeclarationDesugaring extends Desugaring {
  /**
   * @param {ParseTree} rvalue
   */
  constructor(rvalue) {
    super(rvalue);
    this.declarations = [];
  }

  assign(lvalue, rvalue) {
    if (lvalue.type === BINDING_ELEMENT) {
      this.declarations.push(createVariableDeclaration(lvalue.binding,
          rvalue));
      return;
    }

    if (lvalue.type == IDENTIFIER_EXPRESSION)
      lvalue = createBindingIdentifier(lvalue);

    this.declarations.push(createVariableDeclaration(lvalue, rvalue));
  }
}

/**
 * Creates something like "ident" in rvalue ? rvalue.ident : initializer
 */
function createConditionalMemberExpression(rvalue, identToken, initializer) {
  if (identToken.type !== IDENTIFIER) {
    return createConditionalMemberLookupExpression(rvalue,
        new LiteralExpression(null, identToken),
        initializer);
  }

  if (!initializer)
    return createMemberExpression(rvalue, identToken);

  return createConditionalExpression(
      createBinaryOperator(
          createStringLiteral(identToken.value),
          createOperatorToken(IN),
          rvalue),
      createMemberExpression(rvalue, identToken),
      initializer);
}

/**
 * Creates something like [index] in rvalue ? rvalue[index] : initializer
 */
function createConditionalMemberLookupExpression(rvalue, index, initializer) {
  if (!initializer)
    return createMemberLookupExpression(rvalue, index);

  return createConditionalExpression(
      createBinaryOperator(
          index,
          createOperatorToken(IN),
          rvalue),
      createMemberLookupExpression(rvalue, index),
      initializer);
}

/**
 * Desugars destructuring assignment.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:destructuring#assignments">harmony:destructuring</a>
 */
export class DestructuringTransformer extends TempVarTransformer {
  /**
   * @param {ArrayPattern} tree
   * @return {ParseTree}
   */
  transformArrayPattern(tree) {
    // Patterns should be desugared by their parent nodes.
    throw new Error('unreachable');
  }

  /**
   * @param {ObjectPattern} tree
   * @return {ParseTree}
   */
  transformObjectPattern(tree) {
    // Patterns should be desugard by their parent nodes.
    throw new Error('unreachable');
  }

  /**
   * Transforms:
   *   [a, [b, c]] = x
   * From an assignment expression into:
   *   (function (rvalue) {
   *     a = rvalue[0];
   *     [b, c] = rvalue[1];
   *   }).call(this, x);
   *
   * Nested patterns are desugared by recursive calls to transform.
   *
   * @param {BinaryOperator} tree
   * @return {ParseTree}
   */
  transformBinaryOperator(tree) {
    if (tree.operator.type == EQUAL && tree.left.isPattern()) {
      return this.transformAny(this.desugarAssignment_(tree.left, tree.right));
    } else {
      return super.transformBinaryOperator(tree);
    }
  }

  /**
   * @param {ParseTree} lvalue
   * @param {ParseTree} rvalue
   * @return {ParseTree}
   */
  desugarAssignment_(lvalue, rvalue) {
    var tempIdent = createIdentifierExpression(this.addTempVar());
    var desugaring = new AssignmentExpressionDesugaring(tempIdent);

    this.desugarPattern_(desugaring, lvalue);
    desugaring.expressions.unshift(
        createAssignmentExpression(tempIdent, rvalue));
    desugaring.expressions.push(tempIdent);

    return createParenExpression(
        createCommaExpression(desugaring.expressions));
  }

  /**
   * Transforms:
   *   [a, [b, c]] = x
   * From a variable declaration list into:
   *   tmp = x, a = x[0], [b, c] = x[1]
   *
   * We do it this way (as opposed to a block with a declaration and
   * initialization statements) so that we can translate const
   * declarations, which must be initialized at declaration.
   *
   * Nested patterns are desugared by recursive calls to transform.
   *
   * @param {VariableDeclarationList} tree
   * @return {ParseTree}
   */
  transformVariableDeclarationList(tree) {
    if (!this.destructuringInDeclaration_(tree)) {
      // No lvalues to desugar.
      return super.transformVariableDeclarationList(tree);
    }

    this.pushTempVarState();

    // Desugar one level of patterns.
    var desugaredDeclarations = [];
    tree.declarations.forEach((declaration) => {
      if (declaration.lvalue.isPattern()) {
        desugaredDeclarations.push(
            ...this.desugarVariableDeclaration_(declaration));
      } else {
        desugaredDeclarations.push(declaration);
      }
    });

    // Desugar more.
    var transformedTree =  this.transformVariableDeclarationList(
        createVariableDeclarationList(
            tree.declarationType,
            desugaredDeclarations));

    this.popTempVarState();

    return transformedTree;
  }

  transformForInStatement(tree) {
    return this.transformForInOrOf_(tree,
                                    super.transformForInStatement,
                                    ForInStatement);
  }

  transformForOfStatement(tree) {
    return this.transformForInOrOf_(tree,
                                    super.transformForOfStatement,
                                    ForOfStatement);
  }

  /**
   * Transforms for-in and for-of loops.
   * @param  {ForInStatement|ForOfStatement} tree The for-in or for-of loop.
   * @param  {Function} superMethod The super method to call if no pattern is
   *     present.
   * @param  {Function} constr The constructor used to create the transformed
   *     tree.
   * @return {ForInStatement|ForOfStatement} The transformed tree.
   * @private
   */
  transformForInOrOf_(tree, superMethod, constr) {
    if (!tree.initializer.isPattern() &&
        (tree.initializer.type !== VARIABLE_DECLARATION_LIST ||
         !this.destructuringInDeclaration_(tree.initializer))) {
      return superMethod.call(this, tree);
    }

    this.pushTempVarState();

    var declarationType, lvalue;
    if (tree.initializer.isPattern()) {
      declarationType = null;
      lvalue = tree.initializer;
    } else {
      declarationType = tree.initializer.declarationType;
      lvalue = tree.initializer.declarations[0].lvalue;
    }

    // for (var pattern in coll) {
    //
    // =>
    //
    // for (var $tmp in coll) {
    //   var pattern = $tmp;
    //
    // And when the initializer is an assignment expression.
    //
    // for (pattern in coll) {
    //
    // =>
    //
    // for (var $tmp in coll) {
    //   pattern = $tmp;

    var statements = [];
    var binding = this.desugarBinding_(lvalue, statements, declarationType);
    var initializer = createVariableDeclarationList(VAR,
        binding, null);

    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);
    if (body.type !== BLOCK)
      body = createBlock(body);

    statements.push(...body.statements);
    body = createBlock(statements);

    this.popTempVarState();

    return new constr(tree.location, initializer, collection, body);
  }

  transformFunctionDeclaration(tree) {
    return this.transformFunction_(tree, FunctionDeclaration);
  }

  transformFunctionExpression(tree) {
    return this.transformFunction_(tree, FunctionExpression);
  }

  transformFunction_(tree, constructor) {
    stack.push([]);
    var transformedTree = constructor === FunctionExpression ?
        super.transformFunctionExpression(tree) :
        super.transformFunctionDeclaration(tree);
    var statements = stack.pop();
    if (!statements.length)
      return transformedTree;

    // Prepend the var statements to the block.
    statements = prependStatements(transformedTree.functionBody.statements,
                                   ...statements);

    return new constructor(transformedTree.location,
                           transformedTree.name,
                           transformedTree.isGenerator,
                           transformedTree.formalParameterList,
                           createBlock(statements));
  }

  transformSetAccessor(tree) {
    stack.push([]);
    var transformedTree = super.transformSetAccessor(tree);
    var statements = stack.pop();
    if (!statements.length)
      return transformedTree;

    // Prepend the var statements to the block.
    statements.push(...transformedTree.body.statements);

    return new SetAccessor(transformedTree.location,
                           transformedTree.isStatic,
                           transformedTree.name,
                           transformedTree.parameter,
                           createBlock(statements));
  }

  transformBindingElement(tree) {
    // If this has an initializer the default parameter transformer moves the
    // pattern into the function body and it will be taken care of by the
    // variable pass.
    if (!tree.binding.isPattern() || tree.initializer)
      return tree;

    // function f(pattern) { }
    //
    // =>
    //
    // function f($tmp) {
    //   var pattern = $tmp;
    // }

    var statements = stack[stack.length - 1];
    var binding = this.desugarBinding_(tree.binding, statements,
                                       VAR);

    return new BindingElement(null, binding, null);
  }

  transformCatch(tree) {
    if (!tree.binding.isPattern())
      return super.transformCatch(tree);

    // catch(pattern) {
    //
    // =>
    //
    // catch ($tmp) {
    //   let pattern = $tmp

    var body = this.transformAny(tree.catchBody);
    var statements = [];
    var kind = options.blockBinding ? LET : VAR;
    var binding = this.desugarBinding_(tree.binding, statements, kind);
    statements.push(...body.statements);
    return new Catch(tree.location, binding, createBlock(statements));
  }

  /**
   * Helper for transformations that transforms a binding to a temp binding
   * as well as a statement added into a block. For example, this is used by
   * function, for-in/of and catch.
   * @param  {ParseTree} bindingTree The tree with the binding pattern.
   * @param  {Array} statements Array that we add the assignment/variable
   *     declaration to.
   * @param {TokenType?} declarationType The kind of variable declaration to
   *     generate or null if an assignment expression is to be used.
   * @return {BindingIdentifier} The binding tree.
   */
  desugarBinding_(bindingTree, statements, declarationType) {
    var varName = this.getTempIdentifier();
    var binding = createBindingIdentifier(varName);
    var idExpr = createIdentifierExpression(varName);

    var desugaring;
    if (declarationType === null)
      desugaring = new AssignmentExpressionDesugaring(idExpr);
    else
      desugaring = new VariableDeclarationDesugaring(idExpr);

    this.desugarPattern_(desugaring, bindingTree);

    if (declarationType === null) {
      statements.push(createExpressionStatement(
        createCommaExpression(desugaring.expressions)));
    } else {
      statements.push(
          createVariableStatement(
              // Desugar more.
              this.transformVariableDeclarationList(
                  createVariableDeclarationList(
                      declarationType,
                      desugaring.declarations))));
    }

    return binding;
  }

  /**
   * @param {VariableDeclarationList} tree
   * @return {boolean}
   */
  destructuringInDeclaration_(tree) {
    return tree.declarations.some(
        (declaration) => declaration.lvalue.isPattern());
  }

  /**
   * @param {VariableDeclaration} tree
   * @return {Array.<VariableDeclaration>}
   */
  desugarVariableDeclaration_(tree) {
    var tempRValueName = this.getTempIdentifier();
    var tempRValueIdent = createIdentifierExpression(tempRValueName);
    var desugaring;
    var initializer;

    // Don't use parens for these cases:
    // - tree.initializer is assigned to a temporary.
    // - tree.initializer normally doesn't need parens for member access.
    // Don't use temporary if:
    // - there is only one value to assign (and no initializer).
    switch (tree.initializer.type) {
      // Paren not necessary.
      case ARRAY_LITERAL_EXPRESSION:
      case CALL_EXPRESSION:
      case IDENTIFIER_EXPRESSION:
      case LITERAL_EXPRESSION:
      case MEMBER_EXPRESSION:
      case MEMBER_LOOKUP_EXPRESSION:
      case OBJECT_LITERAL_EXPRESSION:
      case PAREN_EXPRESSION:
        initializer = tree.initializer;

      // Paren necessary for single value case.
      default:
        // [1] Try first using a temporary (used later as the base rvalue).
        desugaring = new VariableDeclarationDesugaring(tempRValueIdent);
        desugaring.assign(desugaring.rvalue, tree.initializer);
        var initializerFound = this.desugarPattern_(desugaring, tree.lvalue);

        // [2] Was the temporary necessary? Then return.
        if (initializerFound || desugaring.declarations.length > 2)
          return desugaring.declarations;

        initializer = initializer || createParenExpression(tree.initializer);

        // [3] Redo everything without the temporary.
        desugaring = new VariableDeclarationDesugaring(initializer);
        this.desugarPattern_(desugaring, tree.lvalue);

        return desugaring.declarations;
    }
  }

  /**
   * @param {Desugaring} desugaring
   * @param {ParseTree} tree
   * @return {boolean} True if any of the patterns have an initializer.
   */
  desugarPattern_(desugaring, tree) {
    var initializerFound = false;
    switch (tree.type) {
      case ARRAY_PATTERN: {
        var pattern = tree;

        for (var i = 0; i < pattern.elements.length; i++) {
          var lvalue = pattern.elements[i];
          if (lvalue === null) {
            // A skip, for example [a,,c]
            continue;
          } else if (lvalue.isSpreadPatternElement()) {
            // Rest of the array, for example [x, ...y] = [1, 2, 3]
            desugaring.assign(
                lvalue.lvalue,
                createCallExpression(
                    createMemberExpression(ARRAY, PROTOTYPE, SLICE, CALL),
                    createArgumentList(
                        desugaring.rvalue,
                        createNumberLiteral(i))));
          } else {
            if (lvalue.initializer)
              initializerFound = true;
            desugaring.assign(
                lvalue,
                createConditionalMemberLookupExpression(
                    desugaring.rvalue,
                    createNumberLiteral(i),
                    lvalue.initializer));
          }
        }
        break;
      }

      case OBJECT_PATTERN: {
        var pattern = tree;

        pattern.fields.forEach((field) => {
          var lookup;
          switch (field.type) {
            case BINDING_ELEMENT:
              if (field.initializer)
                initializerFound = true;
              lookup = createConditionalMemberExpression(desugaring.rvalue,
                  field.binding.identifierToken, field.initializer);
              desugaring.assign(
                  createIdentifierExpression(field.binding),
                  lookup);
              break;

            case OBJECT_PATTERN_FIELD:
              if (field.element.initializer)
                initializerFound = true;
              lookup = createConditionalMemberExpression(desugaring.rvalue,
                  field.identifier, field.element.initializer);
              desugaring.assign(field.element, lookup);
              break;

            case IDENTIFIER_EXPRESSION:
              lookup = createMemberExpression(
                  desugaring.rvalue, field.identifierToken);

              desugaring.assign(field, lookup);
              break;

            default:
              throw Error('unreachable');
          }
        });
        break;
      }

      case PAREN_EXPRESSION:
        return this.desugarPattern_(desugaring, tree.expression);

      default:
        throw new Error('unreachable');
    }

    return initializerFound;
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(identifierGenerator, tree) {
    return new DestructuringTransformer(identifierGenerator).transformAny(tree);
  }
}
