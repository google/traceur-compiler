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

/**
 * The javascript keywords.
 */
var keywords = [
  // 7.6.1.1 Keywords
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',

  // 7.6.1.2 Future Reserved Words
  'enum',
  'extends',

  // Future Reserved Words in a strict context
  'implements',
  'interface',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'yield',

  // 7.8 Literals
  'null',
  'true',
  'false',

  // Traceur Specific
  'await'
];

var keywordsByName = Object.create(null);

keywords.forEach((value) => {
  keywordsByName[value] = true;
});

export function isKeyword(value) {
  return !!keywordsByName[value];
};
