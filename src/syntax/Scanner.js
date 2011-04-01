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

traceur.define('syntax', function() {
  'use strict';

  var Token = traceur.syntax.Token;
  var TokenType = traceur.syntax.TokenType;
  var LiteralToken = traceur.syntax.LiteralToken;
  var IdentifierToken = traceur.syntax.IdentifierToken;
  var Keywords = traceur.syntax.Keywords;

  var SourcePosition = traceur.util.SourcePosition;

  /**
   * Scans javascript source code into tokens. All entrypoints assume the
   * caller is not expecting a regular expression literal except for
   * nextRegularExpressionLiteralToken.
   *
   * 7 Lexical Conventions
   *
   * TODO: 7.1 Unicode Format-Control Characters
   *
   * @param {ErrorReport} errorReporter
   * @param {SourceFile} file
   * @param {number=} opt_offset
   * @constructor
   */
  function Scanner(errorReporter, file, opt_offset) {
    this.errorReporter_ = errorReporter;
    this.source_ = file;
    this.index_ = opt_offset || 0;
    this.currentTokens_ = [];
  }

  function isWhitespace(ch) {
    switch (ch) {
      case '\u0009':  // Tab
      case '\u000B':  // Vertical Tab
      case '\u000C':  // Form Feed
      case '\u0020':  // Space
      case '\u00A0':  // No-break space
      case '\uFEFF':  // Byte Order Mark
      case '\n':      // Line Feed
      case '\r':      // Carriage Return
      case '\u2028':  // Line Separator
      case '\u2029':  // Paragraph Separator
      // TODO: there are other Unicode Category 'Zs' chars that should go here.
        return true;
      default:
        return false;
    }
  }

  // 7.3 Line Terminators
  function isLineTerminator(ch) {
    switch (ch) {
    case '\n': // Line Feed
    case '\r':  // Carriage Return
    case '\u2028':  // Line Separator
    case '\u2029':  // Paragraph Separator
      return true;
    default:
      return false;
    }
  }

  function isDecimalDigit(ch) {
    var cc = ch.charCodeAt(0);
    return cc >= 48 && cc <= 57;
  }

  function isHexDigit(ch) {
    var cc = ch.charCodeAt(0);
    // 0 - 9
    return cc >= 48 && cc <= 57 ||
           // A - F
           cc >= 65 && cc <= 70 ||
           // a - f
           cc >= 97 && cc <= 102;

  }

  function isIdentifierStart(ch) {
    switch (ch) {
      case '$':
      case '_':
        return true;
      default:
        return isUnicodeLetter(ch);
    }
  }

  /**
   * UnicodeLetter
   * any character in the Unicode categories "Uppercase letter (Lu)", "Lowercase
   * letter (Ll)", "Titlecase letter (Lt)", "Modifier letter (Lm)", "Other
   * letter (Lo)", or "Letter number (Nl)".
   */
  function isUnicodeLetter(ch) {
    var cc = ch.charCodeAt(0);
    // Uppercase letter (Lu)
    return cc >= 0x0041 && cc <= 0x1D7CA ||
           // Lowercase letter (Ll)
           cc >= 0x0061 && cc <= 0x1D7CB ||
           // Titlecase letter (Lt)
           cc >= 0x01C5 && cc <= 0x1FFC ||
           // Modifier letter (Lm)
           cc >= 0x02B0 && cc <= 0xFF9F ||
           // Other letter (Lo)
           cc >= 0x01BB && cc <= 0x2FA1D ||
           // Letter number (Nl)
           cc >= 0x16EE && cc <= 0x12462;
  }

  Scanner.prototype = {
    /**
     * @type {ErrorReporter}
     * @private
     */
    errorReporter_: null,

    /**
     * @type {SourceFile}
     * @private
     */
    source_: null,

    /**
     * @type {Array.<Token>}
     * @private
     */
    currentTokens_: null,

    /**
     * @type {number}
     * @private
     */
    index_: -1,

    /** @return {LineNumberTable} */
    getLineNumberTable_: function() {
      return this.getFile().lineNumberTable;
    },

    /** @return {SourceFile} */
    getFile: function() {
      return this.source_;
    },

    /** @return {number} */
    getOffset: function() {
      return this.currentTokens_.length == 0 ?
          this.index_ : this.peekToken().location.start.offset;
    },

    /** @return {SourcePosition} */
    getPosition: function() {
      return this.getPosition_(this.getOffset());
    },

    /**
     * @private
     * @return {SourcePosition}
     */
    getPosition_: function(offset) {
      return this.getLineNumberTable_().getSourcePosition(offset);
    },

    /**
     * @return {SourceRange}
     * @private
     */
    getTokenRange_: function(startOffset) {
      return this.getLineNumberTable_().getSourceRange(startOffset,
                                                       this.index_);
    },

    /** @return {Token} */
    nextToken: function() {
      this.peekToken();
      return this.currentTokens_.pop();
    },

    clearTokenLookahead_: function() {
      this.index_ = getOffset();
      this.currentTokens_.length = 0;
    },

    /** @return {LiteralToken} */
    nextRegularExpressionLiteralToken: function() {
      this.clearTokenLookahead_();

      var beginToken = this.index_;

      // leading '/'
      this.this.nextChar_();

      // body
      if (!this.skipRegularExpressionBody_()) {
        return new LiteralToken(TokenType.REGULAR_EXPRESSION,
                                this.getTokenString_(beginToken),
                                this.getTokenRange_(beginToken));
      }

      // separating '/'
      if (this.peekChar_() != '/') {
        this.reportError_('Expected \'/\' in regular expression literal');
        return new LiteralToken(TokenType.REGULAR_EXPRESSION,
                                this.getTokenString_(beginToken),
                                this.getTokenRange_(beginToken));
      }
      this.nextChar_();

      // flags
      while (this.isIdentifierPart_(this.peekChar_())) {
        this.nextChar_();
      }

      return new LiteralToken(TokenType.REGULAR_EXPRESSION,
                              this.getTokenString_(beginToken),
                              this.getTokenRange_(beginToken));
    },

    skipRegularExpressionBody_: function() {
      if (!this.isRegularExpressionFirstChar_(this.peekChar_())) {
        this.reportError_('Expected regular expression first char');
        return false;
      }
      if (!this.skipRegularExpressionChar_()) {
        return false;
      }
      while (this.isRegularExpressionChar_(this.peekChar_())) {
        if (!this.skipRegularExpressionChar_()) {
          return false;
        }
      }
      return true;
    },

    skipRegularExpressionChar_: function() {
      switch (this.peekChar_()) {
        case '\\':
          return this.skipRegularExpressionBackslashSequence_();
        case '[':
          return this.skipRegularExpressionClass_();
        default:
          this.nextChar_();
          return true;
      }
    },

    skipRegularExpressionBackslashSequence_: function() {
      this.nextChar_();
      if (isLineTerminator(this.peekChar_())) {
        this.reportError_('New line not allowed in regular expression literal');
        return false;
      }
      this.nextChar_();
      return true;
    },

    skipRegularExpressionClass_: function() {
      this.nextChar_();
      while (!this.isAtEnd_() && this.peekRegularExpressionClassChar_()) {
        if (!this.skipRegularExpressionClassChar_()) {
          return false;
        }
      }
      if (this.peekChar_() != ']') {
        this.reportError_('\']\' expected');
        return false;
      }
      this.nextChar_();
      return true;
    },

    peekRegularExpressionClassChar_: function() {
      return this.peekChar_() != ']' &&
          !isLineTerminator(this.peekChar_());
    },

    skipRegularExpressionClassChar_: function() {
      if (this.peek_('\\')) {
        return this.skipRegularExpressionBackslashSequence_();
      }
      this.nextChar_();
      return true;
    },

    isRegularExpressionFirstChar_: function(ch) {
      return this.isRegularExpressionChar_(ch) && ch != '*';
    },

    isRegularExpressionChar_: function(ch) {
      switch (ch) {
        case '/':
          return false;
        case '\\':
        case '[':
          return true;
        default:
          return !isLineTerminator(ch);
      }
    },

    /**
     * @return {Token}
     */
    peekToken: function(opt_index) {
      var index = opt_index || 0;
      while (this.currentTokens_.length <= index) {
        this.currentTokens_.push(this.scanToken_());
      }
      return this.currentTokens_[index];
    },

    isAtEnd_: function() {
      return !this.isValidIndex_(this.index_);
    },

    isValidIndex_: function(index) {
      return index >= 0 && index < this.source_.contents.length;
    },

    // 7.2 White Space
    skipWhitespace_: function() {
      while (!this.isAtEnd_() && this.peekWhitespace_()) {
        this.nextChar_();
      }
    },

    peekWhitespace_: function() {
      return isWhitespace(this.peekChar_());
    },

    // 7.4 Comments
    skipComments_: function() {
      while (this.skipComment_()) {}
    },

    skipComment_: function() {
      this.skipWhitespace_();
      if (!this.isAtEnd_() && this.peek_('/')) {
        switch (this.peekChar_(1)) {
        case '/':
          this.skipSingleLineComment_();
          return true;
        case '*':
          this.skipMultiLineComment_();
          return true;
        }
      }
      return false;
    },

    skipSingleLineComment_: function() {
      while (!this.isAtEnd_() && !isLineTerminator(this.peekChar_())) {
        this.nextChar_();
      }
    },

    skipMultiLineComment_: function() {
      this.nextChar_(); // '/'
      this.nextChar_(); // '*'
      while (!this.isAtEnd_() &&
             (this.peekChar_() != '*' || this.peekChar_(1) != '/')) {
        this.nextChar_();
      }
      this.nextChar_();
      this.nextChar_();
    },

    /**
     * @private
     * @return {Token}
     */
    scanToken_: function() {
        this.skipComments_();
        var beginToken = this.index_;
        if (this.isAtEnd_()) {
          return this.createToken_(TokenType.END_OF_FILE, beginToken);
        }
        var ch = this.nextChar_();
        switch (ch) {
          case '{': return this.createToken_(TokenType.OPEN_CURLY, beginToken);
          case '}': return this.createToken_(TokenType.CLOSE_CURLY, beginToken);
          case '(': return this.createToken_(TokenType.OPEN_PAREN, beginToken);
          case ')': return this.createToken_(TokenType.CLOSE_PAREN, beginToken);
          case '[': return this.createToken_(TokenType.OPEN_SQUARE, beginToken);
          case ']': return this.createToken_(TokenType.CLOSE_SQUARE,
                                             beginToken);
          case '.':
            if (isDecimalDigit(this.peekChar_())) {
              return this.scanNumberPostPeriod_(beginToken);
            }

            // Harmony spread operator
            if (this.peek_('.') && this.peekChar_(1) == '.') {
              this.nextChar_();
              this.nextChar_();
              return this.createToken_(TokenType.SPREAD, beginToken);
            }

            return this.createToken_(TokenType.PERIOD, beginToken);
          case ';': return this.createToken_(TokenType.SEMI_COLON, beginToken);
          case ',': return this.createToken_(TokenType.COMMA, beginToken);
          case '~': return this.createToken_(TokenType.TILDE, beginToken);
          case '?': return this.createToken_(TokenType.QUESTION, beginToken);
          case ':': return this.createToken_(TokenType.COLON, beginToken);
          case '<':
            switch (this.peekChar_()) {
              case '<':
                this.nextChar_();
                if (this.peek_('=')) {
                  this.nextChar_();
                  return this.createToken_(TokenType.LEFT_SHIFT_EQUAL,
                                           beginToken);
                }
                return  this.createToken_(TokenType.LEFT_SHIFT, beginToken);
              case '=':
                this.nextChar_();
                return this.createToken_(TokenType.LESS_EQUAL, beginToken);
              default:
                return this.createToken_(TokenType.OPEN_ANGLE, beginToken);
            }
          case '>':
            switch (this.peekChar_()) {
              case '>':
                this.nextChar_();
                switch (this.peekChar_()) {
                case '=':
                  this.nextChar_();
                  return this.createToken_(TokenType.RIGHT_SHIFT_EQUAL,
                                           beginToken);
                case '>':
                  this.nextChar_();
                  if (this.peek_('=')) {
                    this.nextChar_();
                    return this.createToken_(
                        TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL, beginToken);
                  }
                  return this.createToken_(TokenType.UNSIGNED_RIGHT_SHIFT,
                                           beginToken);
                default:
                  return  this.createToken_(TokenType.RIGHT_SHIFT, beginToken);
              }
            case '=':
              this.nextChar_();
              return this.createToken_(TokenType.GREATER_EQUAL, beginToken);
            default:
              return this.createToken_(TokenType.CLOSE_ANGLE, beginToken);
            }
          case '=':
            if (this.peek_('=')) {
              this.nextChar_();
              if (this.peek_('=')) {
                this.nextChar_();
                return this.createToken_(TokenType.EQUAL_EQUAL_EQUAL,
                                         beginToken);
              }
              return this.createToken_(TokenType.EQUAL_EQUAL, beginToken);
            }
            return this.createToken_(TokenType.EQUAL, beginToken);
          case '!':
            if (this.peek_('=')) {
              this.nextChar_();
              if (this.peek_('=')) {
                this.nextChar_();
                return this.createToken_(TokenType.NOT_EQUAL_EQUAL, beginToken);
              }
              return this.createToken_(TokenType.NOT_EQUAL, beginToken);
            }
            return this.createToken_(TokenType.BANG, beginToken);
          case '*':
            if (this.peek_('=')) {
              this.nextChar_();
              return this.createToken_(TokenType.STAR_EQUAL, beginToken);
            }
            return this.createToken_(TokenType.STAR, beginToken);
          case '%':
            if (this.peek_('=')) {
              this.nextChar_();
              return this.createToken_(TokenType.PERCENT_EQUAL, beginToken);
            }
            return this.createToken_(TokenType.PERCENT, beginToken);
          case '^':
            if (this.peek_('=')) {
              this.nextChar_();
              return this.createToken_(TokenType.CARET_EQUAL, beginToken);
            }
            return this.createToken_(TokenType.CARET, beginToken);
          case '/':
            if (this.peek_('=')) {
              this.nextChar_();
              return this.createToken_(TokenType.SLASH_EQUAL, beginToken);
            }
            return this.createToken_(TokenType.SLASH, beginToken);
          case '+':
            switch (this.peekChar_()) {
              case '+':
                this.nextChar_();
                return this.createToken_(TokenType.PLUS_PLUS, beginToken);
              case '=':
                this.nextChar_();
                return this.createToken_(TokenType.PLUS_EQUAL, beginToken);
              default:
                return this.createToken_(TokenType.PLUS, beginToken);
            }
          case '-':
            switch (this.peekChar_()) {
              case '-':
                this.nextChar_();
                return this.createToken_(TokenType.MINUS_MINUS, beginToken);
              case '=':
                this.nextChar_();
                return this.createToken_(TokenType.MINUS_EQUAL, beginToken);
              default:
                return this.createToken_(TokenType.MINUS, beginToken);
            }
          case '&':
            switch (this.peekChar_()) {
              case '&':
                this.nextChar_();
                return this.createToken_(TokenType.AND, beginToken);
              case '=':
                this.nextChar_();
                return this.createToken_(TokenType.AMPERSAND_EQUAL, beginToken);
              default:
                return this.createToken_(TokenType.AMPERSAND, beginToken);
            }
          case '|':
            switch (this.peekChar_()) {
              case '|':
                this.nextChar_();
                return this.createToken_(TokenType.OR, beginToken);
              case '=':
                this.nextChar_();
                return this.createToken_(TokenType.BAR_EQUAL, beginToken);
              default:
                return this.createToken_(TokenType.BAR, beginToken);
            }
          case '#':
            return this.createToken_(TokenType.POUND, beginToken);
          // TODO: add NumberToken
          // TODO: character following NumericLiteral must not be an
          //       IdentifierStart or DecimalDigit
          case '0':
            return this.scanPostZero_(beginToken);
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            return this.scanPostDigit_(beginToken);
          case '"':
          case '\'':
            return this.scanStringLiteral_(beginToken, ch);
          default:
            return this.scanIdentifierOrKeyword_(beginToken, ch);
        }
    },

    /**
     * @return {Token}
     * @private
     */
    scanNumberPostPeriod_: function(beginToken) {
      this.skipDecimalDigits_();
      return this.scanExponentOfNumericLiteral_(beginToken);
    },

    /**
     * @return {Token}
     * @private
     */
    scanPostDigit_: function(beginToken) {
      this.skipDecimalDigits_();
      return this.scanFractionalNumericLiteral_(beginToken);
    },

    /**
     * @return {Token}
     * @private
     */
    scanPostZero_: function(beginToken) {
      switch (this.peekChar_()) {
        case 'x':
        case 'X':
          this.nextChar_();
          if (!isHexDigit(this.peekChar_())) {
            this.reportError_(
                'Hex Integer Literal must contain at least one digit');
          }
          this.skipHexDigits_();
          return new LiteralToken(TokenType.NUMBER,
                                  this.getTokenString_(beginToken),
                                  this.getTokenRange_(beginToken));
        case '.':
          return this.scanFractionalNumericLiteral_(beginToken);
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          return this.scanPostDigit_(beginToken);
        default:
          return new LiteralToken(TokenType.NUMBER,
                                  this.getTokenString_(beginToken),
                                  this.getTokenRange_(beginToken));
      }
    },

    /**
     * @param {TokenType} type
     * @param {number} beginToken
     * @return {Token}
     * @private
     */
    createToken_: function(type, beginToken) {
      return new Token(type, this.getTokenRange_(beginToken));
    },

    /**
     * @return {Token}
     * @private
     */
    scanIdentifierOrKeyword_: function(beginToken, ch) {
      if (ch == '\\') {
        // TODO: Unicode escape sequence
        throw Error('Unicode escape sequence at line ' +
                    this.getPosition().line);
      }
      if (!isIdentifierStart(ch)) {
        this.reportError_(this.getPosition_(beginToken),
                    'Character code \'' +
                    ch.charCodeAt(0) +
                    '\' is not a valid identifier start char');
        return this.createToken_(TokenType.ERROR, beginToken);
      }

      while (this.isIdentifierPart_(this.peekChar_())) {
        this.nextChar_();
      }
      if (ch == '\\') {
        // TODO: Unicode escape sequence
        throw Error('Unicode escape sequence at line ' +
                    this.getPosition().line);
      }

      var value = this.source_.contents.substring(beginToken, this.index_);
      if (Keywords.isKeyword(value)) {
        return new Token(Keywords.getTokenType(value),
                         this.getTokenRange_(beginToken));
      }

      return new IdentifierToken(this.getTokenRange_(beginToken), value);
    },

    isIdentifierPart_: function(ch) {
      // TODO: identifier part character classes
      // CombiningMark
      //   Non-Spacing mark (Mn)
      //   Combining spacing mark(Mc)
      // Connector punctuation (Pc)
      // Zero Width Non-Joiner
      // Zero Width Joiner
      return isIdentifierStart(ch) || isDecimalDigit(ch);
    },

    /**
     * @return {Token}
     * @private
     */
    scanStringLiteral_: function(beginIndex, terminator) {
      while (this.peekStringLiteralChar_(terminator)) {
        if (!this.skipStringLiteralChar_()) {
          return new LiteralToken(TokenType.STRING,
                                  this.getTokenString_(beginIndex),
                                  this.getTokenRange_(beginIndex));
        }
      }
      if (this.peekChar_() != terminator) {
        this.reportError_(this.getPosition_(beginIndex),
                          'Unterminated String Literal');
      } else {
        this.nextChar_();
      }
      return new LiteralToken(TokenType.STRING,
                              this.getTokenString_(beginIndex),
                              this.getTokenRange_(beginIndex));
    },

    getTokenString_: function(beginIndex) {
      return this.source_.contents.substring(beginIndex, this.index_);
    },

    peekStringLiteralChar_: function(terminator) {
      return !this.isAtEnd_() && this.peekChar_() != terminator &&
          !isLineTerminator(this.peekChar_());
    },

    skipStringLiteralChar_: function() {
      if (this.peek_('\\')) {
        return this.skipStringLiteralEscapeSequence_();
      }
      this.nextChar_();
      return true;
    },

    skipStringLiteralEscapeSequence_: function() {
      this.nextChar_();
      if (this.isAtEnd_()) {
        this.reportError_('Unterminated string literal escape sequence');
        return false;
      }
      if (isLineTerminator(this.peekChar_())) {
        this.skipLineTerminator_();
        return true;
      }

      switch (this.nextChar_()) {
        case '\'':
        case '"':
        case '\\':
        case 'b':
        case 'f':
        case 'n':
        case 'r':
        case 't':
        case 'v':
        case '0':
          return true;
        case 'x':
          return this.skipHexDigit_() && this.skipHexDigit_();
        case 'u':
          return this.skipHexDigit_() && this.skipHexDigit_() &&
              this.skipHexDigit_() && this.skipHexDigit_();
        default:
          return true;
      }
    },

    skipHexDigit_: function() {
      if (!isHexDigit(this.peekChar_())) {
        this.reportError_('Hex digit expected');
        return false;
      }
      this.nextChar_();
      return true;
    },

    skipLineTerminator_: function() {
      var first = this.nextChar_();
      if (first == '\r' && this.peek_('\n')) {
        this.nextChar_();
      }
    },

    /**
     * @return {LiteralToken}
     * @private
     */
    scanFractionalNumericLiteral_: function(beginToken) {
      if (this.peek_('.')) {
        this.nextChar_();
        this.skipDecimalDigits_();
      }
      return this.scanExponentOfNumericLiteral_(beginToken);
    },

    /**
     * @return {LiteralToken}
     * @private
     */
    scanExponentOfNumericLiteral_: function(beginToken) {
      switch (this.peekChar_()) {
        case 'e':
        case 'E':
          this.nextChar_();
          switch (this.peekChar_()) {
          case '+':
          case '-':
            this.nextChar_();
            break;
          }
          if (!isDecimalDigit(this.peekChar_())) {
            this.reportError_('Exponent part must contain at least one digit');
          }
          this.skipDecimalDigits_();
          break;
        default:
          break;
      }
      return new LiteralToken(TokenType.NUMBER,
                              this.getTokenString_(beginToken),
                              this.getTokenRange_(beginToken));
    },

    skipDecimalDigits_: function() {
      while (isDecimalDigit(this.peekChar_())) {
        this.nextChar_();
      }
    },

    skipHexDigits_: function() {
      while (isHexDigit(this.peekChar_())) {
        this.nextChar_();
      }
    },

    nextChar_: function() {
      if (this.isAtEnd_()) {
        return '\0';
      }
      return this.source_.contents.charAt(this.index_++);
    },

    peek_: function(ch) {
      return this.peekChar_() == ch;
    },

    peekChar_: function(opt_offset) {
      var offset = opt_offset || 0;
      return !this.isValidIndex_(this.index_ + offset) ?
          '\0' : this.source_.contents.charAt(this.index_ + offset);
    },

    reportError_: function(var_args) {
      var position, message;
      if (arguments[0] instanceof SourcePosition) {
        position = arguments[0];
        message = arguments[1];
      } else {
        position = this.getPosition();
        message = arguments[0];
      }

      this.errorReporter_.reportError(position, message);
    }
  };

  return {
    Scanner: Scanner
  };
});
