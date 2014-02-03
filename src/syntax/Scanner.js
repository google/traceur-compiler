// Copyright 2012 Traceur Authors.
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

import {IdentifierToken} from './IdentifierToken';
import {KeywordToken} from './KeywordToken';
import {LiteralToken} from './LiteralToken';
import {Token} from './Token';
import {getKeywordType} from './Keywords';
import {
  idContinueTable,
  idStartTable
} from './unicode-tables';
import {
  options,
  parseOptions
} from '../options';

import {
  AMPERSAND,
  AMPERSAND_EQUAL,
  AND,
  ARROW,
  AT,
  AWAIT,
  BACK_QUOTE,
  BANG,
  BAR,
  BAR_EQUAL,
  BREAK,
  CARET,
  CARET_EQUAL,
  CASE,
  CATCH,
  CLASS,
  CLOSE_ANGLE,
  CLOSE_CURLY,
  CLOSE_PAREN,
  CLOSE_SQUARE,
  COLON,
  COMMA,
  CONST,
  CONTINUE,
  DEBUGGER,
  DEFAULT,
  DELETE,
  DO,
  DOT_DOT_DOT,
  ELSE,
  END_OF_FILE,
  ENUM,
  EQUAL,
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  ERROR,
  EXPORT,
  EXTENDS,
  FALSE,
  FINALLY,
  FOR,
  FUNCTION,
  GREATER_EQUAL,
  IDENTIFIER,
  IF,
  IMPLEMENTS,
  IMPORT,
  IN,
  INSTANCEOF,
  INTERFACE,
  LEFT_SHIFT,
  LEFT_SHIFT_EQUAL,
  LESS_EQUAL,
  LET,
  MINUS,
  MINUS_EQUAL,
  MINUS_MINUS,
  NEW,
  NO_SUBSTITUTION_TEMPLATE,
  NOT_EQUAL,
  NOT_EQUAL_EQUAL,
  NULL,
  NUMBER,
  OPEN_ANGLE,
  OPEN_CURLY,
  OPEN_PAREN,
  OPEN_SQUARE,
  OR,
  PACKAGE,
  PERCENT,
  PERCENT_EQUAL,
  PERIOD,
  PLUS,
  PLUS_EQUAL,
  PLUS_PLUS,
  PRIVATE,
  PROTECTED,
  PUBLIC,
  QUESTION,
  REGULAR_EXPRESSION,
  RETURN,
  RIGHT_SHIFT,
  RIGHT_SHIFT_EQUAL,
  SEMI_COLON,
  SLASH,
  SLASH_EQUAL,
  STAR,
  STAR_EQUAL,
  STATIC,
  STRING,
  SUPER,
  SWITCH,
  TEMPLATE_HEAD,
  TEMPLATE_MIDDLE,
  TEMPLATE_TAIL,
  THIS,
  THROW,
  TILDE,
  TRUE,
  TRY,
  TYPEOF,
  UNSIGNED_RIGHT_SHIFT,
  UNSIGNED_RIGHT_SHIFT_EQUAL,
  VAR,
  VOID,
  WHILE,
  WITH,
  YIELD
} from './TokenType';

// Some of these is* functions use an array as a lookup table for the lower 7
// bit code points.

var isWhitespaceArray = [];
for (var i = 0; i < 128; i++) {
  isWhitespaceArray[i] = i >= 9 && i <= 13 ||  // Tab - Carriage Return
      i === 0x20;  // Space
}

// Some of these is* functions use an array as a lookup table for the lower 7
// bit code points.

var isWhitespaceArray = [];
for (var i = 0; i < 128; i++) {
  isWhitespaceArray[i] = i >= 9 && i <= 13 ||  // Tab - Carriage Return
      i === 0x20;  // Space
}

function isWhitespace(code) {
  if (code < 128)
    return isWhitespaceArray[code];
  switch (code) {
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return true;
  }
  return false;
  // TODO: there are other Unicode 'Zs' chars that should go here.
}

// 7.3 Line Terminators
export function isLineTerminator(code) {
  switch (code) {
    case 10:  // \n Line Feed
    case 13:  // \r Carriage Return
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return true;
  }
  return false;
}

function isDecimalDigit(code) {
  return code >= 48 && code <= 57;
}

var isHexDigitArray = [];
for (var i = 0; i < 128; i++) {
  isHexDigitArray[i] = i >= 48 && i <= 57 ||  // 0 - 9
      i >= 65 && i <= 70 ||  // A - F
      i >= 97 && i <= 102; // a - f
}
function isHexDigit(code) {
  return code < 128 && isHexDigitArray[code];
}

function isBinaryDigit(code) {
  return code === 48 || code === 49;
}

function isOctalDigit(code) {
  return code >= 48 && code <= 55;  // 0 - 7
}

var isIdentifierStartArray = [];
for (var i = 0; i < 128; i++) {
  isIdentifierStartArray[i] = i === 36 ||  // $
      i >= 65 && i <= 90 ||  // A - Z
      i === 95 ||  // _
      i >= 97 && i <= 122;  // a - z
}

function isIdentifierStart(code) {
  return code < 128 ? isIdentifierStartArray[code] :
      inTable(idStartTable, code);
}

var isIdentifierPartArray = [];
for (var i = 0; i < 128; i++) {
  isIdentifierPartArray[i] = isIdentifierStart(i) || isDecimalDigit(i);
}

function isIdentifierPart(code) {
  return code < 128 ? isIdentifierPartArray[code] :
      inTable(idStartTable, code) || inTable(idContinueTable, code) ||
      code === 8204 || code === 8205;  // <ZWNJ>, <ZWJ>
}


function inTable(table, code) {
  for (var i = 0; i < table.length;) {
    if (code < table[i++])
      return false;
    if (code <= table[i++])
      return true;
  }
  return false;
}

function isRegularExpressionChar(code) {
  switch (code) {
    case 47:  // /
      return false;
    case 91:  // [
    case 92:  // \
      return true;
  }
  return !isLineTerminator(code);
}

function isRegularExpressionFirstChar(code) {
  return isRegularExpressionChar(code) && code !== 42;  // *
}

var index, input, length, token, lastToken, lookaheadToken, currentCharCode,
    lineNumberTable, errorReporter, currentParser;

/**
 * Scans javascript source code into tokens. All entrypoints assume the
 * caller is not expecting a regular expression literal except for
 * nextRegularExpressionLiteralToken.
 *
 * 7 Lexical Conventions
 *
 * TODO: 7.1 Unicode Format-Control Characters
 */
export class Scanner {
  /**
   * @param {ErrorReport} reporter
   * @param {SourceFile} file
   */
  constructor(reporter, file, parser) {
    // These are not instance fields and this class should probably be refactor
    // to not give a false impression that multiple instances can be created.
    errorReporter = reporter;
    lineNumberTable = file.lineNumberTable;
    input = file.contents;
    length = file.contents.length;
    index = 0;
    lastToken = null;
    token = null;
    lookaheadToken = null;
    updateCurrentCharCode();
    currentParser = parser;
  }

  get lastToken() {
    return lastToken;
  }

  /** @return {SourcePosition} */
  getPosition() {
    return getPosition(getOffset());
  }

  nextRegularExpressionLiteralToken() {
    lastToken = nextRegularExpressionLiteralToken();
    token = scanToken();
    return lastToken;
  }

  nextTemplateLiteralToken() {
    var t = nextTemplateLiteralToken();
    token = scanToken();
    return t;
  }

  /** @return {Token} */
  nextToken() {
    return nextToken();
  }

  /**
   * @return {Token}
   */
  peekToken(opt_index) {
    // Too hot for default parameters.
    return opt_index ? peekTokenLookahead() : peekToken();
  }

  peekTokenNoLineTerminator() {
    return peekTokenNoLineTerminator();
  }

  isAtEnd() {
    return isAtEnd();
  }
}

/**
 * @return {SourcePosition}
 */
function getPosition(offset) {
  return lineNumberTable.getSourcePosition(offset);
}

function getTokenRange(startOffset) {
  return lineNumberTable.getSourceRange(startOffset, index);
}

/** @return {number} */
function getOffset() {
  return token ? token.location.start.offset : index;
}

/** @return {LiteralToken} */
function nextRegularExpressionLiteralToken() {
  // We already passed the leading / or /= so subtract the length of the last
  // token.
  var beginIndex = index - token.toString().length;

  // body
  if (!skipRegularExpressionBody()) {
    return new LiteralToken(REGULAR_EXPRESSION,
                            getTokenString(beginIndex),
                            getTokenRange(beginIndex));
  }

  // separating /
  if (currentCharCode !== 47) {  // /
    reportError('Expected \'/\' in regular expression literal');
    return new LiteralToken(REGULAR_EXPRESSION,
                            getTokenString(beginIndex),
                            getTokenRange(beginIndex));
  }
  next();

  // flags
  while (isIdentifierPart(currentCharCode)) {
    next();
  }

  return new LiteralToken(REGULAR_EXPRESSION,
                          getTokenString(beginIndex),
                          getTokenRange(beginIndex));
}

function skipRegularExpressionBody() {
  if (!isRegularExpressionFirstChar(currentCharCode)) {
    reportError('Expected regular expression first char');
    return false;
  }

  while (!isAtEnd() && isRegularExpressionChar(currentCharCode)) {
    if (!skipRegularExpressionChar())
      return false;
  }

  return true;
}

function skipRegularExpressionChar() {
  switch (currentCharCode) {
    case 92:  // \
      return skipRegularExpressionBackslashSequence();
    case 91:  // [
      return skipRegularExpressionClass();
    default:
      next();
      return true;
  }
}

function skipRegularExpressionBackslashSequence() {
  next();
  if (isLineTerminator(currentCharCode) || isAtEnd()) {
    reportError('New line not allowed in regular expression literal');
    return false;
  }
  next();
  return true;
}

function skipRegularExpressionClass() {
  next();
  while (!isAtEnd() && peekRegularExpressionClassChar()) {
    if (!skipRegularExpressionClassChar()) {
      return false;
    }
  }
  if (currentCharCode !== 93) {  // ]
    reportError('\']\' expected');
    return false;
  }
  next();
  return true;
}

function peekRegularExpressionClassChar() {
  return currentCharCode !== 93 &&  // ]
      !isLineTerminator(currentCharCode);
}

function skipRegularExpressionClassChar() {
  if (currentCharCode === 92) {  // \
    return skipRegularExpressionBackslashSequence();
  }
  next();
  return true;
}

// LiteralPortion ::
//   LiteralCharacter LiteralPortion
//   ε
//
// LiteralCharacter ::
//   SourceCharacter but not ` or LineTerminator or \ or $
//   LineTerminatorSequence
//   LineContinuation
//   \ EscapeSequence
//   $ [ lookahead not { ]
//
// TemplateCharacter ::
//   SourceCharacter but not one of ` or \ or $
//   $ [lookahead not { ]
//   \ EscapeSequence
//   LineContinuation
//
function skipTemplateCharacter() {
  while (!isAtEnd()) {
    switch (currentCharCode) {
      case 96:  // `
        return;
      case 92:  // \
        skipStringLiteralEscapeSequence();
        break;
      case 36:  // $
        var code = input.charCodeAt(index + 1);
        if (code === 123)  // {
          return;
        // Fall through.
      default:
        next();
    }
  }
}

/**
 * Either returns a NO_SUBSTITUTION_TEMPLATE or TEMPLATE_HEAD token.
 */
function scanTemplateStart(beginIndex) {
  if (isAtEnd()) {
    reportError('Unterminated template literal');
    return lastToken = createToken(END_OF_FILE, beginIndex);
  }

  return nextTemplateLiteralTokenShared(NO_SUBSTITUTION_TEMPLATE,
                                        TEMPLATE_HEAD);
}

/**
 * Either returns a TEMPLATE_TAIL or TEMPLATE_MIDDLE token.
 */
function nextTemplateLiteralToken() {
  if (isAtEnd()) {
    reportError('Expected \'}\' after expression in template literal');
    return createToken(END_OF_FILE, index);
  }

  if (token.type !== CLOSE_CURLY) {
    reportError('Expected \'}\' after expression in template literal');
    return createToken(ERROR, index);
  }

  return nextTemplateLiteralTokenShared(TEMPLATE_TAIL, TEMPLATE_MIDDLE);
}

function nextTemplateLiteralTokenShared(endType, middleType) {
  var beginIndex = index;

  skipTemplateCharacter();

  if (isAtEnd()) {
    reportError('Unterminated template literal');
    return createToken(ERROR, beginIndex);
  }

  var value = getTokenString(beginIndex);

  switch (currentCharCode) {
    case  96:  // `
      next();
      return lastToken = new LiteralToken(endType,
                                          value,
                                          getTokenRange(beginIndex - 1));
      case 36:  // $
      next();  // $
      next();  // {
      return lastToken = new LiteralToken(middleType,
                                          value,
                                          getTokenRange(beginIndex - 1));
  }
}

/** @return {Token} */
function nextToken() {
  var t = peekToken();
  token = lookaheadToken || scanToken();
  lookaheadToken = null;
  lastToken = t;
  return t;
}

/**
 * Peeks the next token ensuring that there is no line terminator before it.
 * This is done by checking the preceding characters for new lines.
 * @return {Token} This returns null if no token is found before the next
 *     line terminator.
 */
function peekTokenNoLineTerminator() {
  var t = peekToken();
  var start = lastToken.location.end.offset;
  var end = t.location.start.offset;
  for (var i = start; i < end; i++) {
    var code = input.charCodeAt(i);
    if (isLineTerminator(code))
      return null;

    // If we have a block comment we need to skip it since new lines inside
    // the comment are not significant.
    if (code === 47) {  // '/'
      code = input.charCodeAt(++i);
      // End of line comments always mean a new line is present.
      if (code === 47)  // '/'
        return null;
      i = input.indexOf('*/', i) + 2;
    }
  }
  return t;
}

function peekToken() {
  return token || (token = scanToken());
}

// This is optimized to do one lookahead vs current in |peekTooken_|.
function peekTokenLookahead() {
  if (!token)
    token = scanToken();
  if (!lookaheadToken)
    lookaheadToken = scanToken();
  return lookaheadToken;
}

// 7.2 White Space
function skipWhitespace() {
  while (!isAtEnd() && peekWhitespace()) {
    next();
  }
}

function peekWhitespace() {
  return isWhitespace(currentCharCode);
}

// 7.4 Comments
function skipComments() {
  while (skipComment()) {}
}

function skipComment() {
  skipWhitespace();
  var code = currentCharCode;
  if (code === 47) {  // /
    code = input.charCodeAt(index + 1);
    switch (code) {
      case 47:  // /
        skipSingleLineComment();
        return true;
      case 42:  // *
        skipMultiLineComment();
        return true;
    }
  }
  return false;
}

function commentCallback(start, index) {
 if (options.commentCallback)
    currentParser.handleComment(lineNumberTable.getSourceRange(start, index));
}

function skipSingleLineComment() {
  var start = index;
  // skip '//'
  index += 2;
  while (!isAtEnd() && !isLineTerminator(input.charCodeAt(index++))) {}
  updateCurrentCharCode();
  commentCallback(start, index);
}

function skipMultiLineComment() {
  var start = index;
  var i = input.indexOf('*/', index + 2);
  if (i !== -1)
    index = i + 2;
  else
    index = length;
  updateCurrentCharCode();
  commentCallback(start, index);
}

/**
 * @return {Token}
 */
function scanToken() {
  skipComments();
  var beginIndex = index;
  if (isAtEnd())
    return createToken(END_OF_FILE, beginIndex);

  var code = currentCharCode;
  next();

  switch (code) {
    case 123:  // {
      return createToken(OPEN_CURLY, beginIndex);
    case 125:  // }
      return createToken(CLOSE_CURLY, beginIndex);
    case 40:  // (
      return createToken(OPEN_PAREN, beginIndex);
    case 41:  // )
      return createToken(CLOSE_PAREN, beginIndex);
    case 91:  // [
      return createToken(OPEN_SQUARE, beginIndex);
    case 93:  // ]
      return createToken(CLOSE_SQUARE, beginIndex);
    case 46:  // .
      switch (currentCharCode) {
        case 46:  // .
          // Harmony spread operator
          if (input.charCodeAt(index + 1) === 46) {
            next();
            next();
            return createToken(DOT_DOT_DOT, beginIndex);
          }
          break;
        default:
          if (isDecimalDigit(currentCharCode))
            return scanNumberPostPeriod(beginIndex);
      }

      return createToken(PERIOD, beginIndex);
    case 59:  // ;
      return createToken(SEMI_COLON, beginIndex);
    case 44:  // ,
      return createToken(COMMA, beginIndex);
    case 126:  // ~
      return createToken(TILDE, beginIndex);
    case 63:  // ?
      return createToken(QUESTION, beginIndex);
    case 58:  // :
      return createToken(COLON, beginIndex);
    case 60:  // <
      switch (currentCharCode) {
        case 60:  // <
          next();
          if (currentCharCode === 61) {  // =
            next();
            return createToken(LEFT_SHIFT_EQUAL, beginIndex);
          }
          return createToken(LEFT_SHIFT, beginIndex);
        case 61:  // =
          next();
          return createToken(LESS_EQUAL, beginIndex);
        default:
          return createToken(OPEN_ANGLE, beginIndex);
      }
    case 62:  // >
      switch (currentCharCode) {
        case 62:  // >
          next();
          switch (currentCharCode) {
            case 61:  // =
              next();
              return createToken(RIGHT_SHIFT_EQUAL, beginIndex);
            case 62:  // >
              next();
              if (currentCharCode === 61) { // =
                next();
                return createToken(
                    UNSIGNED_RIGHT_SHIFT_EQUAL, beginIndex);
              }
              return createToken(UNSIGNED_RIGHT_SHIFT, beginIndex);
            default:
              return createToken(RIGHT_SHIFT, beginIndex);
          }
        case 61:  // =
          next();
          return createToken(GREATER_EQUAL, beginIndex);
        default:
          return createToken(CLOSE_ANGLE, beginIndex);
      }
    case 61:  // =
      if (currentCharCode === 61) {  // =
        next();
        if (currentCharCode === 61) {  // =
          next();
          return createToken(EQUAL_EQUAL_EQUAL, beginIndex);
        }
        return createToken(EQUAL_EQUAL, beginIndex);
      }
      if (currentCharCode === 62) {  // >
        next();
        return createToken(ARROW, beginIndex);
      }
      return createToken(EQUAL, beginIndex);
    case 33:  // !
      if (currentCharCode === 61) {  // =
        next();
        if (currentCharCode === 61) {  // =
          next();
          return createToken(NOT_EQUAL_EQUAL, beginIndex);
        }
        return createToken(NOT_EQUAL, beginIndex);
      }
      return createToken(BANG, beginIndex);
    case 42:  // *
      if (currentCharCode === 61) {  // =
        next();
        return createToken(STAR_EQUAL, beginIndex);
      }
      return createToken(STAR, beginIndex);
    case 37:  // %
      if (currentCharCode === 61) {  // =
        next();
        return createToken(PERCENT_EQUAL, beginIndex);
      }
      return createToken(PERCENT, beginIndex);
    case 94:  // ^
      if (currentCharCode === 61) {  // =
        next();
        return createToken(CARET_EQUAL, beginIndex);
      }
      return createToken(CARET, beginIndex);
    case 47:  // /
      if (currentCharCode === 61) {  // =
        next();
        return createToken(SLASH_EQUAL, beginIndex);
      }
      return createToken(SLASH, beginIndex);
    case 43:  // +
      switch (currentCharCode) {
        case 43:  // +
          next();
          return createToken(PLUS_PLUS, beginIndex);
        case 61: // =:
          next();
          return createToken(PLUS_EQUAL, beginIndex);
        default:
          return createToken(PLUS, beginIndex);
      }
    case 45:  // -
      switch (currentCharCode) {
        case 45: // -
          next();
          return createToken(MINUS_MINUS, beginIndex);
        case 61:  // =
          next();
          return createToken(MINUS_EQUAL, beginIndex);
        default:
          return createToken(MINUS, beginIndex);
      }
    case 38:  // &
      switch (currentCharCode) {
        case 38:  // &
          next();
          return createToken(AND, beginIndex);
        case 61:  // =
          next();
          return createToken(AMPERSAND_EQUAL, beginIndex);
        default:
          return createToken(AMPERSAND, beginIndex);
      }
    case 124:  // |
      switch (currentCharCode) {
        case 124:  // |
          next();
          return createToken(OR, beginIndex);
        case 61:  // =
          next();
          return createToken(BAR_EQUAL, beginIndex);
        default:
          return createToken(BAR, beginIndex);
      }
    case 96:  // `
      return scanTemplateStart(beginIndex);
    case 64:  // @
      return createToken(AT, beginIndex);

      // TODO: add NumberToken
      // TODO: character following NumericLiteral must not be an
      //       IdentifierStart or DecimalDigit
    case 48:  // 0
      return scanPostZero(beginIndex);
    case 49:  // 1
    case 50:  // 2
    case 51:  // 3
    case 52:  // 4
    case 53:  // 5
    case 54:  // 6
    case 55:  // 7
    case 56:  // 8
    case 57:  // 9
      return scanPostDigit(beginIndex);
    case 34:  // "
    case 39:  // '
      return scanStringLiteral(beginIndex, code);
    default:
      return scanIdentifierOrKeyword(beginIndex, code);
  }
}

/**
 * @return {Token}
 */
function scanNumberPostPeriod(beginIndex) {
  skipDecimalDigits();
  return scanExponentOfNumericLiteral(beginIndex);
}

/**
 * @return {Token}
 */
function scanPostDigit(beginIndex) {
  skipDecimalDigits();
  return scanFractionalNumericLiteral(beginIndex);
}

/**
 * @return {Token}
 */
function scanPostZero(beginIndex) {
  switch (currentCharCode) {
    case 46:  // .
      return scanFractionalNumericLiteral(beginIndex);

    case 88:  // X
    case 120:  // x
      next();
      if (!isHexDigit(currentCharCode)) {
        reportError('Hex Integer Literal must contain at least one digit');
      }
      skipHexDigits();
      return new LiteralToken(NUMBER,
                              getTokenString(beginIndex),
                              getTokenRange(beginIndex));

    case 66:  // B
    case 98:  // b
      if (!parseOptions.numericLiterals)
        break;

      next();
      if (!isBinaryDigit(currentCharCode)) {
        reportError('Binary Integer Literal must contain at least one digit');
      }
      skipBinaryDigits();
      return new LiteralToken(NUMBER,
                              getTokenString(beginIndex),
                              getTokenRange(beginIndex));

    case 79:  // O
    case 111:  // o
      if (!parseOptions.numericLiterals)
        break;

      next();
      if (!isOctalDigit(currentCharCode)) {
        reportError('Octal Integer Literal must contain at least one digit');
      }
      skipOctalDigits();
      return new LiteralToken(NUMBER,
                              getTokenString(beginIndex),
                              getTokenRange(beginIndex));

    case 48:  // 0
    case 49:  // 1
    case 50:  // 2
    case 51:  // 3
    case 52:  // 4
    case 53:  // 5
    case 54:  // 6
    case 55:  // 7
    case 56:  // 8
    case 57:  // 9
      return scanPostDigit(beginIndex);
  }

  return new LiteralToken(NUMBER,
                          getTokenString(beginIndex),
                          getTokenRange(beginIndex));
}

/**
 * @param {TokenType} type
 * @param {number} beginIndex
 * @return {Token}
 */
function createToken(type, beginIndex) {
  return new Token(type, getTokenRange(beginIndex));
}

function readUnicodeEscapeSequence() {
  var beginIndex = index;
  if (currentCharCode === 117) {  // u
    next();
    if (skipHexDigit() && skipHexDigit() &&
        skipHexDigit() && skipHexDigit()) {
      return parseInt(getTokenString(beginIndex + 1), 16);
    }
  }

  reportError('Invalid unicode escape sequence in identifier', beginIndex - 1);

  return 0;
}

/**
 * @param {number} beginIndex
 * @param {number} code
 * @return {Token}
 */
function scanIdentifierOrKeyword(beginIndex, code) {
  // Keep track of any unicode escape sequences.
  var escapedCharCodes;
  if (code === 92) {  // \
    code = readUnicodeEscapeSequence();
    escapedCharCodes = [code];
  }

  if (!isIdentifierStart(code)) {
    reportError(
        `Character code '${code}' is not a valid identifier start char`,
        beginIndex);
    return createToken(ERROR, beginIndex);
  }

  for (;;) {
    code = currentCharCode;
    if (isIdentifierPart(code)) {
      next();
    } else if (code === 92) {  // \
      next();
      code = readUnicodeEscapeSequence();
      if (!escapedCharCodes)
        escapedCharCodes = [];
      escapedCharCodes.push(code);
      if (!isIdentifierPart(code))
        return createToken(ERROR, beginIndex);
    } else {
      break;
    }
  }

  var value = input.slice(beginIndex, index);
  var keywordType = getKeywordType(value);
  if (keywordType)
    return new KeywordToken(value, keywordType, getTokenRange(beginIndex));

  if (escapedCharCodes) {
    var i = 0;
    value = value.replace(/\\u..../g, function(s) {
      return String.fromCharCode(escapedCharCodes[i++]);
    });
  }

  return new IdentifierToken(getTokenRange(beginIndex), value);
}

/**
 * @return {Token}
 */
function scanStringLiteral(beginIndex, terminator) {
  while (peekStringLiteralChar(terminator)) {
    if (!skipStringLiteralChar()) {
      return new LiteralToken(STRING,
                              getTokenString(beginIndex),
                              getTokenRange(beginIndex));
    }
  }
  if (currentCharCode !== terminator) {
    reportError('Unterminated String Literal', beginIndex);
  } else {
    next();
  }
  return new LiteralToken(STRING,
                          getTokenString(beginIndex),
                          getTokenRange(beginIndex));
}

function getTokenString(beginIndex) {
  return input.substring(beginIndex, index);
}

function peekStringLiteralChar(terminator) {
  return !isAtEnd() && currentCharCode !== terminator &&
      !isLineTerminator(currentCharCode);
}

function skipStringLiteralChar() {
  if (currentCharCode === 92) {
    return skipStringLiteralEscapeSequence();
  }
  next();
  return true;
}

function skipStringLiteralEscapeSequence() {
  next(); // \
  if (isAtEnd()) {
    reportError('Unterminated string literal escape sequence');
    return false;
  }

  if (isLineTerminator(currentCharCode)) {
    skipLineTerminator();
    return true;
  }

  var code = currentCharCode;
  next();
  switch (code) {
    case 39:  // '
    case 34:  // "
    case 92:  // \
    case 98:  // b
    case 102:  // f
    case 110:  // n
    case 114:  // r
    case 116:  // t
    case 118:  // v
    case 48:  // 0
      return true;
    case 120:  // x
      return skipHexDigit() && skipHexDigit();
    case 117:  // u
      return skipHexDigit() && skipHexDigit() &&
          skipHexDigit() && skipHexDigit();
    default:
      return true;
  }
}

function skipHexDigit() {
  if (!isHexDigit(currentCharCode)) {
    reportError('Hex digit expected');
    return false;
  }
  next();
  return true;
}

function skipLineTerminator() {
  var first = currentCharCode;
  next();
  if (first === 13 && currentCharCode === 10) {  // \r and \n
    next();
  }
}

/**
 * @return {LiteralToken}
 */
function scanFractionalNumericLiteral(beginIndex) {
  if (currentCharCode === 46) {  // .
    next();
    skipDecimalDigits();
  }
  return scanExponentOfNumericLiteral(beginIndex);
}

/**
 * @return {LiteralToken}
 */
function scanExponentOfNumericLiteral(beginIndex) {
  switch (currentCharCode) {
    case 101:  // e
    case 69:  // E
      next();
      switch (currentCharCode) {
        case 43:  // +
        case 45:  // -
          next();
          break;
      }
      if (!isDecimalDigit(currentCharCode)) {
        reportError('Exponent part must contain at least one digit');
      }
      skipDecimalDigits();
      break;
    default:
      break;
  }
  return new LiteralToken(NUMBER,
                          getTokenString(beginIndex),
                          getTokenRange(beginIndex));
}

function skipDecimalDigits() {
  while (isDecimalDigit(currentCharCode)) {
    next();
  }
}

function skipHexDigits() {
  while (isHexDigit(currentCharCode)) {
    next();
  }
}

function skipBinaryDigits() {
  while (isBinaryDigit(currentCharCode)) {
    next();
  }
}

function skipOctalDigits() {
  while (isOctalDigit(currentCharCode)) {
    next();
  }
}

function isAtEnd() {
  return index === length;
}

function next() {
  index++;
  updateCurrentCharCode();
}

function updateCurrentCharCode() {
  currentCharCode = input.charCodeAt(index);
}

function reportError(message, indexArg = index) {
  var position = getPosition(indexArg);
  errorReporter.reportError(position, message);
}
