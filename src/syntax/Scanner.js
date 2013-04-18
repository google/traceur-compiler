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

import {AtNameToken} from './AtNameToken.js';
import {IdentifierToken} from './IdentifierToken.js';
import {KeywordToken} from './KeywordToken.js';
import {LiteralToken} from './LiteralToken.js';
import {Token} from './Token.js';
import {getKeywordType} from './Keywords.js';
import * from './TokenType.js';

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

var isIdentifierStartArray = [];
for (var i = 0; i < 128; i++) {
  isIdentifierStartArray[i] = i === 36 ||  // $
      i >= 65 && i <= 90 ||  // A - Z
      i === 95 ||  // _
      i >= 97 && i <= 122;  // a - z
}

function isIdentifierStart(code) {
  return code < 128 ? isIdentifierStartArray[code] : isUnicodeLetter(code);
}

var isIdentifierPartArray = [];
for (var i = 0; i < 128; i++) {
  isIdentifierPartArray[i] = isIdentifierStart(i) || isDecimalDigit(i);
}

function isIdentifierPart(code) {
  // TODO: identifier part character classes
  // CombiningMark
  //   Non-Spacing mark (Mn)
  //   Combining spacing mark(Mc)
  // Connector punctuation (Pc)
  // Zero Width Non-Joiner
  // Zero Width Joiner
  return code < 128 ? isIdentifierPartArray[code] : isUnicodeLetter(code);
}

// This is auto generated from the unicode tables.
// The tables are at:
// http://www.fileformat.info/info/unicode/category/Lu/list.htm
// http://www.fileformat.info/info/unicode/category/Ll/list.htm
// http://www.fileformat.info/info/unicode/category/Lt/list.htm
// http://www.fileformat.info/info/unicode/category/Lm/list.htm
// http://www.fileformat.info/info/unicode/category/Lo/list.htm
// http://www.fileformat.info/info/unicode/category/Nl/list.htm

var unicodeLetterTable =
    [170, 170, 181, 181, 186, 186, 192, 214,
     216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750,
     880, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908,
     910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366,
     1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1610,
     1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775,
     1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957,
     1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069,
     2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2308, 2361,
     2365, 2365, 2384, 2384, 2392, 2401, 2417, 2423, 2425, 2431,
     2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482,
     2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529,
     2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608,
     2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654,
     2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736,
     2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785,
     2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867,
     2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929,
     2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970,
     2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001,
     3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123,
     3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212,
     3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261,
     3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344,
     3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455,
     3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526,
     3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716,
     3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743,
     3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760,
     3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3805,
     3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138,
     4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198,
     4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4304, 4346,
     4348, 4348, 4352, 4680, 4682, 4685, 4688, 4694, 4696, 4696,
     4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789,
     4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880,
     4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740,
     5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900,
     5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000,
     6016, 6067, 6103, 6103, 6108, 6108, 6176, 6263, 6272, 6312,
     6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516,
     6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823,
     6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7104, 7141,
     7168, 7203, 7245, 7247, 7258, 7293, 7401, 7404, 7406, 7409,
     7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013,
     8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061,
     8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140,
     8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188,
     8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455,
     8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486,
     8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521,
     8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358,
     11360, 11492, 11499, 11502, 11520, 11557, 11568, 11621,
     11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694,
     11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726,
     11728, 11734, 11736, 11742, 11823, 11823, 12293, 12295,
     12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438,
     12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589,
     12593, 12686, 12704, 12730, 12784, 12799, 13312, 13312,
     19893, 19893, 19968, 19968, 40907, 40907, 40960, 42124,
     42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539,
     42560, 42606, 42623, 42647, 42656, 42735, 42775, 42783,
     42786, 42888, 42891, 42894, 42896, 42897, 42912, 42921,
     43002, 43009, 43011, 43013, 43015, 43018, 43020, 43042,
     43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259,
     43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442,
     43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595,
     43616, 43638, 43642, 43642, 43648, 43695, 43697, 43697,
     43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714,
     43739, 43741, 43777, 43782, 43785, 43790, 43793, 43798,
     43808, 43814, 43816, 43822, 43968, 44002, 44032, 44032,
     55203, 55203, 55216, 55238, 55243, 55291, 63744, 64045,
     64048, 64109, 64112, 64217, 64256, 64262, 64275, 64279,
     64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316,
     64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433,
     64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019,
     65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370,
     65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495,
     65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594,
     65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786,
     65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334,
     66352, 66378, 66432, 66461, 66464, 66499, 66504, 66511,
     66513, 66517, 66560, 66717, 67584, 67589, 67592, 67592,
     67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669,
     67840, 67861, 67872, 67897, 68096, 68096, 68112, 68115,
     68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405,
     68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687,
     69763, 69807, 73728, 74606, 74752, 74850, 77824, 78894,
     92160, 92728, 110592, 110593, 119808, 119892, 119894, 119964,
     119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980,
     119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069,
     120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121,
     120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144,
     120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570,
     120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686,
     120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779,
     131072, 131072, 173782, 173782, 173824, 173824, 177972, 177972,
     177984, 177984, 178205, 178205, 194560, 195101];

/**
 * UnicodeLetter
 * any character in the Unicode categories "Uppercase letter (Lu)", "Lowercase
 * letter (Ll)", "Titlecase letter (Lt)", "Modifier letter (Lm)", "Other
 * letter (Lo)", or "Letter number (Nl)".
 */
function isUnicodeLetter(code) {
  for (var i = 0; i < unicodeLetterTable.length;) {
    if (code < unicodeLetterTable[i++])
      return false;
    if (code <= unicodeLetterTable[i++])
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
  // We already passed the leading / so subtract 1.
  var beginIndex = index - 1;

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
  if (isLineTerminator(currentCharCode)) {
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

function skipSingleLineComment() {
  var start = index;
  // skip '//'
  index += 2;
  while (!isAtEnd() && !isLineTerminator(input.charCodeAt(index++))) {}
  updateCurrentCharCode();
  currentParser.handleSingleLineComment(input, start, index - 1);
}

function skipMultiLineComment() {
  var i = input.indexOf('*/', index + 2);
  if (i !== -1)
    index = i + 2;
  else
    index = length;
  updateCurrentCharCode();
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
        case 123:  // {
          // .{ chain operator
          next();
          return createToken(PERIOD_OPEN_CURLY, beginIndex);
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
      return scanAtName(beginIndex);

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
    case 46:  // .
      return scanFractionalNumericLiteral(beginIndex);
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
    default:
      return new LiteralToken(NUMBER,
                              getTokenString(beginIndex),
                              getTokenRange(beginIndex));
  }
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

function scanAtName(beginIndex) {
  if (isAtEnd()) {
    reportError('Expected identifier start character', beginIndex);
    return createToken(ERROR, beginIndex);
  }

  // TODO(arv): Refactor to not create an intermediate token.
  var code = currentCharCode;
  next();
  var identifierToken = scanIdentifierOrKeyword(beginIndex, code);
  if (identifierToken.type === ERROR)
    return identifierToken;
  var value = identifierToken.value;
  return new AtNameToken(getTokenRange(beginIndex), value);
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
