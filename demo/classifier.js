// Copyright 2011 Google Inc.
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

(function() {
  'use strict';

  var Scanner = traceur.syntax.Scanner;
  var SourceRange = traceur.util.SourceRange;
  var TokenType = traceur.syntax.TokenType;
  var PredefinedName = traceur.syntax.PredefinedName;

  var Classification = {
    ERROR: 'error',
    COMMENT: 'comment',
    IDENTIFIER: 'identifier',
    KEYWORD: 'keyword',
    PUNCTUATOR: 'punctuator',
    STRING: 'string',
    NUMBER: 'number',
    REGEX: 'regex',
    CONTEXTUAL: 'contextual'
  };

  /**
   * Represents the classification of a region of text
   * @param {Classification} category
   * @param {string} text
   * @constructor
   */
  function ClassifiedText(category, text) {
    this.category = category;
    this.text = text;
    Object.freeze(this);
  }

  /**
   * Classifies javascript tokens into their token category. This can be used
   * for colorization
   *
   * @param {ErrorReport} errorReporter
   * @param {SourceFile} file
   * @param {number=} opt_offset
   * @constructor
   * @extends {Scanner}
   */
  function Classifier(errorReporter, file, opt_offset) {
    Scanner.call(this, errorReporter, file, opt_offset);
    this.classifications_ = [];
  }

  var proto = Scanner.prototype;
  Classifier.prototype = {
    __proto__: proto,

    /** @type {number} */
    lastClassifierLocation_: 0,

    /**
     * @param {Classification} category
     * @param {SourceRange} location
     */
    pushResult_: function(category, location) {
      var start = location.start.offset;
      var end = location.end.offset;
      var contents = this.source_.contents;

      traceur.assert(this.lastClassifierLocation_ <= start);
      var code;
      if (this.lastClassifierLocation_ < start) {
        code = contents.substring(this.lastClassifierLocation_, start);

        this.classifications_.push(new ClassifiedText(null, code));
      }

      code = contents.substring(start, end);
      this.classifications_.push(new ClassifiedText(category, code));
      this.lastClassifierLocation_ = end;
    },

    // Comments don't come back as tokens, so we need to override them to
    // capture the spans.
    skipSingleLineComment_: function() {
      var beginToken = this.index_;
      proto.skipSingleLineComment_.call(this);
      this.pushResult_(Classification.COMMENT, this.getTokenRange_(beginToken));
    },

    skipMultiLineComment_: function() {
      var beginToken = this.index_;
      proto.skipMultiLineComment_.call(this);
      this.pushResult_(Classification.COMMENT, this.getTokenRange_(beginToken));
    },

    scanToken_: function() {
      var token = proto.scanToken_.call(this);
      var c;
      switch (token.type) {
        case TokenType.ERROR:
          c = Classification.ERROR;
          break;

        case TokenType.IDENTIFIER:
          // contextual keywords
          switch (token.value) {
            case PredefinedName.GET:
            case PredefinedName.MIXIN:
            case PredefinedName.MODULE:
            case PredefinedName.MODULE:
            case PredefinedName.REQUIRE:
            case PredefinedName.REQUIRES:
            case PredefinedName.SET:
            case PredefinedName.TRAIT:
              c = Classification.CONTEXTUAL;
              break;
            default: // otherwise, identifier
              c = Classification.IDENTIFIER;
          }
          break;

        case TokenType.BREAK:
        case TokenType.CASE:
        case TokenType.CATCH:
        case TokenType.CONTINUE:
        case TokenType.DEBUGGER:
        case TokenType.DEFAULT:
        case TokenType.DELETE:
        case TokenType.DO:
        case TokenType.ELSE:
        case TokenType.FINALLY:
        case TokenType.FOR:
        case TokenType.FUNCTION:
        case TokenType.IF:
        case TokenType.IN:
        case TokenType.INSTANCEOF:
        case TokenType.NEW:
        case TokenType.RETURN:
        case TokenType.SWITCH:
        case TokenType.THIS:
        case TokenType.THROW:
        case TokenType.TRY:
        case TokenType.TYPEOF:
        case TokenType.VAR:
        case TokenType.VOID:
        case TokenType.WHILE:
        case TokenType.WITH:
        case TokenType.CLASS:
        case TokenType.CONST:
        case TokenType.ENUM:
        case TokenType.EXPORT:
        case TokenType.EXTENDS:
        case TokenType.IMPORT:
        case TokenType.SUPER:
        case TokenType.IMPLEMENTS:
        case TokenType.INTERFACE:
        case TokenType.LET:
        case TokenType.PACKAGE:
        case TokenType.PRIVATE:
        case TokenType.PROTECTED:
        case TokenType.PUBLIC:
        case TokenType.STATIC:
        case TokenType.YIELD:
        case TokenType.AWAIT:

        // These are treated as keywords in other colorizers
        case TokenType.NULL:
        case TokenType.TRUE:
        case TokenType.FALSE:

        // Seems like this should be colorized as a keyword, since it's a
        // short form of "function"
        case TokenType.POUND:
          c = Classification.KEYWORD;
          break;

        case TokenType.OPEN_CURLY:
        case TokenType.CLOSE_CURLY:
        case TokenType.OPEN_PAREN:
        case TokenType.CLOSE_PAREN:
        case TokenType.OPEN_SQUARE:
        case TokenType.CLOSE_SQUARE:
        case TokenType.PERIOD:
        case TokenType.SEMI_COLON:
        case TokenType.COMMA:
        case TokenType.OPEN_ANGLE:
        case TokenType.CLOSE_ANGLE:
        case TokenType.LESS_EQUAL:
        case TokenType.GREATER_EQUAL:
        case TokenType.EQUAL_EQUAL:
        case TokenType.NOT_EQUAL:
        case TokenType.EQUAL_EQUAL_EQUAL:
        case TokenType.NOT_EQUAL_EQUAL:
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.STAR:
        case TokenType.PERCENT:
        case TokenType.PLUS_PLUS:
        case TokenType.MINUS_MINUS:
        case TokenType.LEFT_SHIFT:
        case TokenType.RIGHT_SHIFT:
        case TokenType.UNSIGNED_RIGHT_SHIFT:
        case TokenType.AMPERSAND:
        case TokenType.BAR:
        case TokenType.CARET:
        case TokenType.BANG:
        case TokenType.TILDE:
        case TokenType.AND:
        case TokenType.OR:
        case TokenType.QUESTION:
        case TokenType.COLON:
        case TokenType.EQUAL:
        case TokenType.PLUS_EQUAL:
        case TokenType.MINUS_EQUAL:
        case TokenType.STAR_EQUAL:
        case TokenType.PERCENT_EQUAL:
        case TokenType.LEFT_SHIFT_EQUAL:
        case TokenType.RIGHT_SHIFT_EQUAL:
        case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL:
        case TokenType.AMPERSAND_EQUAL:
        case TokenType.BAR_EQUAL:
        case TokenType.CARET_EQUAL:
        case TokenType.SLASH:
        case TokenType.SLASH_EQUAL:
        case TokenType.SPREAD:
          c = Classification.OPERATOR;
          break;

        // 7.8 Literals
        case TokenType.NUMBER:
          c = Classification.NUMBER;
          break;

        case TokenType.STRING:
          c = Classification.STRING;
          break;

        case TokenType.REGULAR_EXPRESSION:
          c = Classification.REGEX;
          break;

        case TokenType.END_OF_FILE:
        default:
          // We're done, or we didn't understand something. Exit.
          return token;
      }
      this.pushResult_(c, token.location);
      return token;
    }
  };

  /**
   * @param {string} source
   * @return {Array.<Classification>}
   */
  function getClassifiedTokens(source) {
    var errors = new traceur.util.ErrorReporter();
    var sourceFile = new traceur.syntax.SourceFile('inline-script', source);
    var classifier = new Classifier(errors, sourceFile);

    while (classifier.nextToken().type !== TokenType.END_OF_FILE) {
    }

    return classifier.classifications_;
  }

  /**
   * @param {string} source
   * @return {string} source the source with classification <span> tags added.
   */
  function classifySource(source) {
    var result = [];
    getClassifiedTokens(source).forEach(function(c) {
      if (c.category) {
        result.push('<span class="', c.category, '">', c.text, '</span>');
      } else {
        result.push(c.text);
      }
    });
    return result.join('');
  }

  function classifyAllScripts() {
    var scripts = document.querySelectorAll('pre');
    Array.prototype.forEach.call(scripts, function(preElement) {
      // get textContent to strip out existing <span >tags
      var source = preElement.textContent;

      // write it back as innerHTML to preserve <span> tags
      preElement.innerHTML = classifySource(source);
    });
  }

  classifyAllScripts();

})();
