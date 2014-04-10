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

/** @fileoverview Re-import Traceur via System.import().
 * The import will cause on-the-file recompilation of traceur source.
 * The resulting image will have correct source file names for debugging.
 */

import {ErrorReporter} from '../src/util/ErrorReporter';
import {LoaderHooks} from '../src/runtime/LoaderHooks';
import {TraceurLoader} from '../src/runtime/TraceurLoader';
import {webLoader} from '../src/runtime/webLoader';

var reporter = new ErrorReporter();
// This loaderHooks does not read modules out of ModuleStore
var dynamicModuleStore = new $traceurRuntime.ModuleStore();
var loaderHooks = new LoaderHooks(reporter, System.baseURL, webLoader, dynamicModuleStore);

// Overwrite global system value.
System = new TraceurLoader(loaderHooks);