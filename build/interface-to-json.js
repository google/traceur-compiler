// Copyright 2014 Traceur Authors.
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

import {Compiler} from '../src/Compiler.js';
import {ParseTreeVisitor} from '../src/syntax/ParseTreeVisitor.js';
import {UNION_TYPE} from '../src/syntax/trees/ParseTreeType.js';
import {write} from '../src/outputgeneration/TreeWriter.js';

// This file parses a limited .d.ts of the form:
//
//   interface ArrayLiteralExpression {
//     location: SourceRange;
//     elements: Array<ParseTree>;
//   }
//
// and converts that into a json structure that the build tools use.

class Visitor extends ParseTreeVisitor {
  constructor() {
    this.trees = {};
    this.current = null;
  }
  visitInterfaceDeclaration(tree) {
    var name = tree.name.value;
    this.current = this.trees[name] = {};
    super.visitInterfaceDeclaration(tree);
  }
  visitPropertySignature(tree) {
    var name = tree.name.literalToken.value;
    if (tree.typeAnnotation.type === UNION_TYPE) {
      this.current[name] = tree.typeAnnotation.types.map(write);
    } else {
      this.current[name] = [write(tree.typeAnnotation)];
    }
  }
}

export function getTrees(content, filename) {
  var tree = new Compiler({types: true}).parse(content, filename);
  var b = new Visitor();
  b.visitAny(tree);
  return b.trees;
}
