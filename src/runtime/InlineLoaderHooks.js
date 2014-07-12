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

import {LoaderHooks} from './LoaderHooks';
import {Script} from '../syntax/trees/ParseTrees';

export class InlineLoaderHooks extends LoaderHooks {

	constructor(url, elements, fileLoader, moduleStore) {
	  super(null, url, fileLoader, moduleStore);
	  this.elements = elements;
	}

 	evaluateCodeUnit(codeUnit) {
    // Don't eval. Instead append the trees to the output.
    var tree = codeUnit.metadata.transformedTree;
    this.elements.push.apply(this.elements, tree.scriptItemList);
  }

	toTree() {
	  return new Script(null, this.elements);
	}
}

