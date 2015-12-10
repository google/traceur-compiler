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

// Used by unit tests only
import './util/MutedErrorReporter.js';

export {WebPageTranscoder} from './WebPageTranscoder.js';
export {HTMLImportTranscoder} from './HTMLImportTranscoder.js';
import {addOptions, CommandOptions, Options} from './Options.js';

// The ModuleStore has to be instantiated before we can register any modules.
// That means our normal module registration, System.registerModule()
// cannot be applied to ModuleStore. We can use System.set() to store the
// ModuleStore module, but that function does not work for --modules=inline.
let ModuleStore = $traceurRuntime.ModuleStore;

export function get(name) {
  return ModuleStore.get(ModuleStore.normalize('./' + name, __moduleName));
}

import {ErrorReporter} from './util/ErrorReporter.js';
import {CollectingErrorReporter} from './util/CollectingErrorReporter.js';

export let util = {
  addOptions,
  CommandOptions,
  CollectingErrorReporter,
  ErrorReporter,
  Options
};

