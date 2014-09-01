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

import {ErrorReporter} from '../util/ErrorReporter';
import {TraceurLoader} from '../runtime/TraceurLoader';
import {LoaderCompiler} from './LoaderCompiler';
import {webLoader} from './webLoader';

var url;
var fileLoader;
if (typeof window !== 'undefined' && window.location) {
  url = window.location.href;
  fileLoader = webLoader;
}

var traceurLoader = new TraceurLoader(fileLoader, url);

Reflect.global.System = traceurLoader;

export { traceurLoader as System }

traceurLoader.map = traceurLoader.semverMap(__moduleName);
