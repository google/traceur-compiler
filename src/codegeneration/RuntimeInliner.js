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

import {MutedErrorReporter} from '../util/MutedErrorReporter';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {Parser} from '../syntax/Parser';
import {Script, Module} from '../syntax/trees/ParseTrees';
import {SourceFile} from '../syntax/SourceFile';
import {VAR} from '../syntax/TokenType';
import {assert} from '../util/assert';
import {
  createIdentifierExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory';
import {prependStatements} from './PrependStatements';

// Some helper functions that other runtime functions may depend on.
var shared = {
  TypeError: `TypeError`,
  Object: `Object`,
  defineProperty: `%Object.defineProperty`,
  getOwnPropertyDescriptor: `%Object.getOwnPropertyDescriptor`,
  getOwnPropertyNames: `%Object.getOwnPropertyNames`,
  getPrototypeOf: `%Object.getPrototypeOf`,
  iterator: `'@@iterator'`,
  returnThis: `function() { return this; }`,
  toObject:
      `function(value) {
        if (value == null)
          throw %TypeError();
        return %Object(value);
      }`,
  getDescriptors:
      `function(object) {
        var descriptors = {}, name, names = %getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
          var name = names[i];
          descriptors[name] = %getOwnPropertyDescriptor(object, name);
        }
        return descriptors;
      }`,
  getPropertyDescriptor:
      `function(object, name) {
        while (object !== null) {
          var result = %getOwnPropertyDescriptor(object, name);
          if (result)
            return result;
          object = %getPrototypeOf(object);
        }
        return undefined;
      }`
};

function parse(source, name) {
  var file = new SourceFile('@traceur/generated/' + name, source);
  var errorReporter = new MutedErrorReporter();
  return new Parser(errorReporter, file).parseAssignmentExpression();
}

function prependRuntimeVariables(map, statements) {
  var names = Object.keys(map);

  if (!names.length)
    return statements;

  var vars = names.filter((name) => !map[name].inserted).map((name) => {
    var item = map[name];
    item.inserted = true;
    return createVariableDeclaration(item.uid, item.expression);
  });

  if (!vars.length)
    return statements;

  return prependStatements(statements,
      createVariableStatement(createVariableDeclarationList(VAR, vars)));
}

/**
 * Class responsible for keeping track of inlined runtime functions and to
 * do the actual inlining of the function into the head of the program.
 */
export class RuntimeInliner extends ParseTreeTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super();
    this.identifierGenerator = identifierGenerator;
    this.map_ = Object.create(null);
  }

  /**
   * Prepends the program with the function definitions for the runtime
   * functions.
   * @param {Script} tree
   * @return {Script}
   */
  transformScript(tree) {
    var statements = prependRuntimeVariables(this.map_, tree.scriptItemList);
    if (statements === tree.scriptItemList)
      return tree;
    return new Script(tree.location, statements);
  }

  /**
   *
   *
   *
   */
  transformModule(tree) {
    var statements = prependRuntimeVariables(this.map_, tree.scriptItemList);
    if (statements === tree.scriptItemList)
      return tree;
    return new Module(tree.location, statements);
  }

  /**
   * Registers a runtime function.
   * @param {string} name The name that identifies the runtime function.
   * @param {string} source
   */
  register(name, source) {
    if (name in this.map_)
      return;

    var self = this;
    source = source.replace(/%([a-zA-Z0-9_$]+)/g, function(_, name) {
      if (name in shared) {
        self.register(name, shared[name]);
      }
      return self.getAsString(name);
    });

    var uid = this.identifierGenerator.getUniqueIdentifier(name);
    this.map_[name] = {
      expression: parse(source, name),
      uid: uid,
      inserted: false,
    };
  }

  /**
   * Gets the identifier expression for the identifier that represents the
   * runtime function.
   * @param {string} name
   * @return {IdentifierExpression}
   */
  getAsIdentifierExpression(name) {
    return createIdentifierExpression(this.map_[name].uid);
  }

  /**
   * Gets the string of the identifier that represents the runtime function.
   * @param {string} name
   * @return {string}
   */
  getAsString(name) {
    return this.map_[name].uid;
  }

  /**
   * @param {string} name The runtime function.
   * @param {string=} source The source of the function as a string. If
   *     |name| has not been registered before then this is a required
   *     parameter.
   * @return {IdentifierExpression}
   */
  get(name, source = undefined) {
    if (!(name in this.map_)) {
      if (name in shared)
        source = shared[name];
      assert(source);
      this.register(name, source);
    }
    return this.getAsIdentifierExpression(name);
  }
}
