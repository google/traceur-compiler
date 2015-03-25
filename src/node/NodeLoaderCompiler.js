// Copyright 2015 Traceur Authors.
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

import {LoaderCompiler} from '../runtime/LoaderCompiler.js';

export class NodeLoaderCompiler extends LoaderCompiler {
  evaluateCodeUnit(codeUnit) {
    // TODO(jjb): can we move this to file scope?
    let runInThisContext = require('vm').runInThisContext;
    let content = codeUnit.metadata.transcoded;
    let filename = codeUnit.address || codeUnit.normalizedName;
    // Node eval does not support //# sourceURL yet.
    // In node we use a low level evaluator so that the
    // sourcemap=memory mechanism can help us debug.
    let result = runInThisContext(content, filename);
    codeUnit.metadata.transformedTree = null;
    return result;
  }
}
