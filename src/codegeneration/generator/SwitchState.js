// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import State from 'State.js';
import {
  createBreakStatement,
  createStatementList
} from '../ParseTreeFactory.js';
import createObject from '../../util/util.js';
import trees from '../../syntax/trees/ParseTrees.js';

var CaseClause = trees.CaseClause;
var DefaultClause = trees.DefaultClause;
var SwitchStatement = trees.SwitchStatement;


/**
 * Represents a pair of ParseTree and integer.
 * Immutable.
 *
 * TODO: this came from Pair. Better member names?
 *
 * @param {ParseTree} first
 * @param {number} second
 * @constructor
 */
export function SwitchClause(first, second) {
  this.first = first;
  this.second = second;
}

/**
 * Represents the dispatch portion of a switch statement that has been added
 * to a StateMachine.
 *
 * SwitchStates are immutable.
 *
 * @param {number} id
 * @param {ParseTree} expression
 * @param {Array.<SwitchClause>} clauses
 * @constructor
 * @extends {State}
 */
export function SwitchState(id, expression, clauses) {
  State.call(this, id);
  this.expression = expression;
  this.clauses = clauses;
}

SwitchState.prototype = createObject(State.prototype, {

  /**
   * Represents the dispatch portion of an if/else block.
   * ConditionalStates are immutable.
   *
   * @param {number} oldState
   * @param {number} newState
   * @return {SwitchState}
   */
  replaceState: function(oldState, newState) {
    var clauses = this.clauses.map((clause) => {
      return new SwitchClause(clause.first,
          State.replaceStateId(clause.second, oldState, newState));
    });
    return new SwitchState(
        State.replaceStateId(this.id, oldState, newState),
        this.expression,
        clauses);
  },

  /**
   * @param {FinallyState} enclosingFinally
   * @param {number} machineEndState
   * @param {ErrorReporter} reporter
   * @return {Array.<ParseTree>}
   */
  transform: function(enclosingFinally, machineEndState, reporter) {
    var clauses = [];
    for (var i = 0; i < this.clauses.length; i++) {
      var clause = this.clauses[i];
      if (clause.first == null) {
        clauses.push(new DefaultClause(null,
            State.generateJump(enclosingFinally, clause.second)));
      } else {
        clauses.push(new CaseClause(null, clause.first,
            State.generateJump(enclosingFinally, clause.second)));
      }
    }
    return createStatementList(
        new SwitchStatement(null, this.expression, clauses),
        createBreakStatement());
  }
});
