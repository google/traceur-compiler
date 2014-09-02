// Copyright 2014 Traceur Authors.
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

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {LiteralExpression} from '../syntax/trees/ParseTrees';
import {STRING} from '../syntax/TokenType';

var re = /\\u{([0-9a-f]+)}/gi;

function zeroPad(value) {
  return '0000'.slice(value.length) + value;
}

function needsTransform(token) {
  return token.type === STRING && re.test(token.value);
}

function transformToken(token) {
  return token.value.replace(re, (match, hexDigits) => {
    var codePoint = parseInt(hexDigits, 16);
    if (codePoint <= 0xFFFF) {
      return '\\u' + zeroPad(codePoint.toString(16).toUpperCase());
    }
    var high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
    var low = (codePoint - 0x10000) % 0x400 + 0xDC00;
    return '\\u' + high.toString(16).toUpperCase() +
           '\\u' + low.toString(16).toUpperCase();
  });
}

export class UnicodeEscapeSequenceTransformer extends ParseTreeTransformer {
  transformLiteralExpression(tree) {
    var token = tree.literalToken;
    if (needsTransform(token))
      return new LiteralExpression(tree.location, transformToken(token));
    return tree;
  }
}
