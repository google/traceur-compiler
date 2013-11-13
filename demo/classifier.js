// Copyright 2011 Traceur Authors.
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

var classifyTraceurTokens = function() {};

(function() {
  'use strict';

  var Scanner = traceur.syntax.Scanner;
  var SourceRange = traceur.util.SourceRange;
  var TokenType = traceur.syntax.TokenType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var ErrorReporter = traceur.util.ErrorReporter;
  var SourceFile = traceur.syntax.SourceFile;
  var Keywords = traceur.syntax.Keywords;

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
  }

  /**
   * Classifies javascript tokens into their token category. This can be used
   * for colorization.
   *
   * TODO(jmesserly): regex and contextual keywords need a parse to be colorized
   * correctly.
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
            case PredefinedName.MODULE:
            case PredefinedName.SET:
              c = Classification.CONTEXTUAL;
              break;
            default: // otherwise, identifier
              c = Classification.IDENTIFIER;
          }
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
        case TokenType.DOT_DOT_DOT:
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

        // These are treated as keywords in other colorizers
        case TokenType.NULL:
        case TokenType.TRUE:
        case TokenType.FALSE:

        // Seems like this should be colorized as a keyword, since it's a
        // short form of "function"
        case TokenType.POUND:
          c = Classification.KEYWORD;
          break;

        case TokenType.END_OF_FILE:
        default:
          if (Keywords.isKeyword(token.type)) {
            c = Classification.KEYWORD;
            break;
          }
          // EOF, or we didn't understand something. Exit.
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
    var sourceFile = new SourceFile('inline-script', source);
    var classifier = new Classifier(new ErrorReporter(), sourceFile);

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

  classifyTraceurTokens = classifySource;

  function classifyAllScripts() {
    var scripts = document.querySelectorAll('pre');
    Array.prototype.forEach.call(scripts, function(preElement) {
      // get textContent to strip out existing <span >tags
      var source = preElement.textContent;
      var classifiedSource = classifySource(source);

      // write it back as innerHTML to preserve <span> tags
      preElement.innerHTML = classifiedSource;
    });
  }

  classifyAllScripts();

})();
