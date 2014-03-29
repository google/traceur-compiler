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
  ARRAY_COMPREHENSION,
  ARRAY_LITERAL_EXPRESSION,
  ARRAY_PATTERN,
  ARROW_FUNCTION_EXPRESSION,
  BINDING_ELEMENT,
  BINDING_IDENTIFIER,
  BLOCK,
  CALL_EXPRESSION,
  CLASS_EXPRESSION,
  COMPUTED_PROPERTY_NAME,
  FUNCTION_EXPRESSION,
  GENERATOR_COMPREHENSION,
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  OBJECT_LITERAL_EXPRESSION,
  OBJECT_PATTERN,
  OBJECT_PATTERN_FIELD,
  PAREN_EXPRESSION,
  THIS_EXPRESSION,
  VARIABLE_DECLARATION_LIST,
} from '../syntax/trees/ParseTreeType';
import {
  BindingElement,
  Catch,
  ForInStatement,
  ForOfStatement,
  LiteralExpression
} from '../syntax/trees/ParseTrees';
import {ParameterTransformer} from './ParameterTransformer';
import {
  EQUAL,
  IDENTIFIER,
  LET,
  REGULAR_EXPRESSION,
  VAR
} from '../syntax/TokenType';
import {
  createAssignmentExpression,
  createBindingIdentifier,
  createBlock,
  createCommaExpression,
  createExpressionStatement,
  createIdentifierExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createNumberLiteral,
  createParenExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory';
import {options} from '../options';
import {parseExpression} from './PlaceholderParser';

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
    lvalue = lvalue instanceof BindingElement ? lvalue.binding : lvalue;
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
    if (lvalue instanceof BindingElement) {
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
 * Creates something like "ident" in rvalue ? rvalue.ident : initialiser
 */
function createConditionalMemberExpression(rvalue, name, initialiser) {
  if (name.type === COMPUTED_PROPERTY_NAME) {
    return createConditionalMemberLookupExpression(rvalue,
        name.expression,
        initialiser);
  }

  var token;
  if (name.type == BINDING_IDENTIFIER) {
    token = name.identifierToken;
  } else {
    token = name.literalToken;
    if (!token.isKeyword() && token.type !== IDENTIFIER) {
      return createConditionalMemberLookupExpression(rvalue,
          new LiteralExpression(null, token),
          initialiser);
    }
  }

  if (!initialiser)
    return createMemberExpression(rvalue, token);

  return parseExpression
      `${token.toString()} in ${rvalue} ? ${rvalue}.${token} : ${initialiser}`;
}

function createConditionalMemberLookupExpression(rvalue, index, initialiser) {
  if (!initialiser)
    return createMemberLookupExpression(rvalue, index);

  return parseExpression
      `${index} in ${rvalue} ? ${rvalue}[${index}] : ${initialiser}`;
}

function staticallyKnownObject(tree) {
  switch (tree.type) {
    case OBJECT_LITERAL_EXPRESSION:
    case ARRAY_LITERAL_EXPRESSION:
    case ARRAY_COMPREHENSION:
    case GENERATOR_COMPREHENSION:
    case ARROW_FUNCTION_EXPRESSION:
    case FUNCTION_EXPRESSION:
    case CLASS_EXPRESSION:
    case THIS_EXPRESSION:
      return true;
    case LITERAL_EXPRESSION:
      return tree.literalToken.type === REGULAR_EXPRESSION;
  }
  return false;
}

function createGuardedExpression(tree) {
  if (staticallyKnownObject(tree))
    return tree;
  return parseExpression `$traceurRuntime.assertObject(${tree})`;
}

function createGuardedAssignment(lvalue, rvalue) {
  return parseExpression `${lvalue} = ${createGuardedExpression(rvalue)}`;
}



/**
 * Desugars destructuring assignment.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:destructuring#assignments">harmony:destructuring</a>
 */
export class DestructuringTransformer extends ParameterTransformer {
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
    }
    return super(tree);
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
    desugaring.expressions.unshift(createGuardedAssignment(tempIdent, rvalue));
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
   * declarations, which must be initialised at declaration.
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
    var transformedTree = this.transformVariableDeclarationList(
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
    if (!tree.initialiser.isPattern() &&
        (tree.initialiser.type !== VARIABLE_DECLARATION_LIST ||
         !this.destructuringInDeclaration_(tree.initialiser))) {
      return superMethod.call(this, tree);
    }

    this.pushTempVarState();

    var declarationType, lvalue;
    if (tree.initialiser.isPattern()) {
      declarationType = null;
      lvalue = tree.initialiser;
    } else {
      declarationType = tree.initialiser.declarationType;
      lvalue = tree.initialiser.declarations[0].lvalue;
    }

    // for (var pattern in coll) {
    //
    // =>
    //
    // for (var $tmp in coll) {
    //   var pattern = $tmp;
    //
    // And when the initialiser is an assignment expression.
    //
    // for (pattern in coll) {
    //
    // =>
    //
    // for (var $tmp in coll) {
    //   pattern = $tmp;

    var statements = [];
    var binding = this.desugarBinding_(lvalue, statements, declarationType);
    var initialiser = createVariableDeclarationList(VAR,
        binding, null);

    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);
    if (body.type !== BLOCK)
      body = createBlock(body);

    statements.push(...body.statements);
    body = createBlock(statements);

    this.popTempVarState();

    return new constr(tree.location, initialiser, collection, body);
  }

  transformBindingElement(tree) {
    // If this has an initialiser the default parameter transformer moves the
    // pattern into the function body and it will be taken care of by the
    // variable pass.
    if (!tree.binding.isPattern() || tree.initialiser)
      return tree;

    // function f(pattern) { }
    //
    // =>
    //
    // function f($tmp) {
    //   var pattern = $tmp;
    // }

    var statements = this.parameterStatements;
    var binding = this.desugarBinding_(tree.binding, statements, VAR);

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
    var initialiser;

    // Don't use parens for these cases:
    // - tree.initialiser is assigned to a temporary.
    // - tree.initialiser normally doesn't need parens for member access.
    // Don't use temporary if:
    // - there is only one value to assign (and no initialiser).
    switch (tree.initialiser.type) {
      // Paren not necessary.
      case ARRAY_LITERAL_EXPRESSION:
      case CALL_EXPRESSION:
      case IDENTIFIER_EXPRESSION:
      case LITERAL_EXPRESSION:
      case MEMBER_EXPRESSION:
      case MEMBER_LOOKUP_EXPRESSION:
      case OBJECT_LITERAL_EXPRESSION:
      case PAREN_EXPRESSION:
        initialiser = tree.initialiser;

      // Paren necessary for single value case.
      default:
        // [1] Try first using a temporary (used later as the base rvalue).
        desugaring = new VariableDeclarationDesugaring(tempRValueIdent);
        desugaring.assign(
            desugaring.rvalue,
            createGuardedExpression(tree.initialiser));
        var initialiserFound = this.desugarPattern_(desugaring, tree.lvalue);

        // [2] Was the temporary necessary? Then return.
        if (initialiserFound || desugaring.declarations.length > 2)
          return desugaring.declarations;

        initialiser = createGuardedExpression(initialiser || tree.initialiser);

        // [3] Redo everything without the temporary.
        desugaring = new VariableDeclarationDesugaring(initialiser);
        this.desugarPattern_(desugaring, tree.lvalue);

        return desugaring.declarations;
    }
  }

  /**
   * @param {Desugaring} desugaring
   * @param {ParseTree} tree
   * @return {boolean} True if any of the patterns have an initialiser.
   */
  desugarPattern_(desugaring, tree) {
    var initialiserFound = false;
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
                parseExpression
                    `Array.prototype.slice.call(${desugaring.rvalue}, ${i})`);
          } else {
            if (lvalue.initialiser)
              initialiserFound = true;
            desugaring.assign(
                lvalue,
                createConditionalMemberLookupExpression(
                    desugaring.rvalue,
                    createNumberLiteral(i),
                    lvalue.initialiser));
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
              if (field.initialiser)
                initialiserFound = true;
              lookup = createConditionalMemberExpression(desugaring.rvalue,
                  field.binding, field.initialiser);
              desugaring.assign(
                  createIdentifierExpression(field.binding),
                  lookup);
              break;

            case OBJECT_PATTERN_FIELD:
              if (field.element.initialiser)
                initialiserFound = true;
              var name = field.name;
              lookup = createConditionalMemberExpression(desugaring.rvalue,
                  name, field.element.initialiser);
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

    // In case we have `var {} = expr` or `var [] = expr` we use a temp
    // variable name so that the expression still gets executed.
    //
    // AssignmentExpressionDesugaring already works.
    if (desugaring instanceof VariableDeclarationDesugaring &&
        desugaring.declarations.length === 0) {
      desugaring.assign(createBindingIdentifier(this.getTempIdentifier()),
                        desugaring.rvalue);
    }

    return initialiserFound;
  }
}
