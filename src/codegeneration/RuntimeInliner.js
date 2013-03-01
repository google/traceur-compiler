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

import {MutedErrorReporter} from '../util/MutedErrorReporter.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {Parser} from '../syntax/Parser.js';
import {Program} from '../syntax/trees/ParseTrees.js';
import {SourceFile} from '../syntax/SourceFile.js';
import {VAR} from '../syntax/TokenType.js';
import {
  createIdentifierExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory.js';
import {prependStatements} from './PrependStatements.js';

// Some helper functions that other runtime functions may depend on.
var shared = {
  toObject:
      `function(value) {
        if (value == null)
          throw TypeError();
        return Object(value);
      }`,
  getDescriptors:
      `function(object) {
        var descriptors = {}, name, names = Object.getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
          var name = names[i];
          descriptors[name] = Object.getOwnPropertyDescriptor(object, name);
        }
        return descriptors;
      }`
};

function parse(source, name) {
  var file = new SourceFile(name + '@runtime', source);
  var errorReporter = new MutedErrorReporter();
  return new Parser(errorReporter, file).parseAssignmentExpression();
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
   * @param {Program} tree
   * @return {Program}
   */
  transformProgram(tree) {
    var names = Object.keys(this.map_);
    if (!names.length)
      return tree;

    var vars = names.filter(function(name) {
      return !this.map_[name].inserted;
    }, this).map(function(name) {
      var item = this.map_[name];
      item.inserted = true;
      return createVariableDeclaration(item.uid, item.expression);
    }, this);
    if (!vars.length)
      return tree;

    var variableStatement = createVariableStatement(
        createVariableDeclarationList(VAR, vars));

    var programElements = prependStatements(
        tree.programElements, variableStatement);
    return new Program(tree.location, programElements);
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
      traceur.assert(source);
      this.register(name, source);
    }
    return this.getAsIdentifierExpression(name);
  }
}
